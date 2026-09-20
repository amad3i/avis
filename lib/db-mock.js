// In-memory имитация Prisma-клиента для работы в режиме DATA_MODE="mock".
//
// Заглушка, которая позволяет запускать и хостить проект без базы данных:
// каталог, оформление заказов, админка и кухня работают на данных из
// lib/mock-data.js, хранящихся в памяти процесса. Ничего не пишется на диск
// и не требует подключения к Neon.
//
// Реализует ровно тот поднабор API Prisma, который использует код проекта:
//   findMany / findFirst / findUnique
//   create / update / updateMany / upsert / delete / deleteMany
//   groupBy (sum/_count), include (sizes, items, category, _count)
//
// To switch to the real DB, set DATA_MODE="db" (see lib/config.js). This
// module is intentionally separate from lib/db.js so the real Prisma client
// stays untouched.

import { mockSettingsMap, mockProducts, mockOptions, mockSlides, mockCategories, mockOrders } from "./mock-data";

const collections = {
  setting: new Map(),
  product: new Map(),
  category: new Map(),
  size: new Map(),
  option: new Map(),
  slide: new Map(),
  order: new Map(),
  orderItem: new Map(),
};

function seedCollections() {
  Object.entries(mockSettingsMap).forEach(([k, v], i) => {
    collections.setting.set(k, { id: i + 1, key: k, value: v });
  });
  for (const c of mockCategories) {
    collections.category.set(c.id, { ...c, id: c.id });
  }
  for (const p of mockProducts) {
    const record = { ...p };
    delete record.sizes;
    collections.product.set(p.id, record);
    for (const s of p.sizes) {
      collections.size.set(s.id, { ...s });
    }
  }
  for (const o of mockOptions) {
    collections.option.set(o.id, { ...o });
  }
  for (const s of mockSlides) {
    collections.slide.set(s.id, { ...s });
  }
  // Демо-заказы: заполняют доску кухни, админ-заказы и аналитику в mock-режиме
  // и дают рабочие ссылки /order/<id>?token=... «из коробки».
  for (const o of mockOrders) {
    const { items, ...order } = o;
    collections.order.set(order.id, { ...order });
    for (const it of items) {
      collections.orderItem.set(it.id, { ...it, orderId: order.id });
    }
  }
}
seedCollections();

// Эвристика дефолтов, повторяющая @default(...) из prisma/schema.prisma для
// полей, которые создающие код не передаёт явно. Позволяет вести себя как Prisma.
const DEFAULTS = {
  product: { description: "", gallery: "[]", emoji: "🌯", icon: "wrap", hit: false, isNew: false, active: true, sortOrder: 0, image: null },
  category: { emoji: "🌯", icon: "wrap", sortOrder: 0, active: true },
  size: { sortOrder: 0 },
  option: { sortOrder: 0, active: true, group: "addon" },
  slide: { chip: "", subtitle: "", ctaText: "Смотреть услуги", ctaLink: "/#menu", cta2Text: "", cta2Link: "", image: null, active: true, sortOrder: 0 },
  order: { comment: "", pickupAt: "", status: "new", canceledBy: null, prevStatus: null, cancelToken: null, ip: "" },
  orderItem: { options: "[]", quantity: 1, sizeLabel: "" },
};

function withDefaults(table, data, extra = {}) {
  const rec = { ...(DEFAULTS[table] || {}), ...data, ...extra };
  if (table === "order") {
    rec.createdAt = rec.createdAt || new Date();
    rec.updatedAt = new Date();
  }
  return rec;
}

// ---------- helpers ----------

function matchesWhere(rec, where) {
  if (!where) return true;
  return Object.entries(where).every(([key, cond]) => {
    let val = rec[key];
    if (cond && typeof cond === "object" && !Array.isArray(cond) && !(cond instanceof Date)) {
      const operator = cond;
      if (operator.in !== undefined) return Array.isArray(operator.in) ? operator.in.includes(val) : false;
      if (operator.not !== undefined) {
        if (val === null && operator.not === null) return true;
        return val !== operator.not;
      }
      if (operator.gte !== undefined) return val >= operator.gte;
      if (operator.lte !== undefined) return val <= operator.lte;
      if (operator.lt !== undefined) return val < operator.lt;
      if (operator.gt !== undefined) return val > operator.gt;
      if (operator.startsWith !== undefined) return String(val).startsWith(operator.startsWith);
      if (Object.prototype.hasOwnProperty.call(operator, "null")) return (val === null) === !!operator.null;
      return true;
    }
    if (cond === null) return val === null;
    return val === cond;
  });
}

function applyInclude(rec, include) {
  if (!include) return { ...rec };
  const out = { ...rec };
  for (const [rel, opts] of Object.entries(include)) {
    if (rel === "sizes") {
      const by = opts?.orderBy?.[0];
      let sizes = [...collections.size.values()].filter((s) => s.productId === rec.id).map((s) => ({ ...s }));
      if (by) {
        const [k, dir] = Object.entries(by)[0];
        sizes.sort((a, b) => (dir === "desc" ? b[k] - a[k] : a[k] - b[k]));
      }
      out.sizes = sizes;
    } else if (rel === "items") {
      out.items = [...collections.orderItem.values()].filter((it) => it.orderId === rec.id).map((it) => ({ ...it }));
    } else if (rel === "category") {
      out.category = collections.category.get(rec.categoryId) ? { ...collections.category.get(rec.categoryId) } : null;
    } else if (rel === "product") {
      out.product = collections.product.get(rec.productId) ? { ...collections.product.get(rec.productId) } : null;
    } else if (rel === "_count") {
      const sel = opts?.select || {};
      const count = {};
      for (const [counter, flag] of Object.entries(sel)) {
        if (!flag) continue;
        if (counter === "products") count.products = [...collections.product.values()].filter((p) => p.categoryId === rec.id).length;
        else if (counter === "items") count.items = [...collections.orderItem.values()].filter((it) => it.orderId === rec.id).length;
        else count[counter] = 0;
      }
      out._count = count;
    }
  }
  return out;
}

function orderRows(rows, orderBy) {
  if (!orderBy || orderBy.length === 0) return rows;
  const list = Array.isArray(orderBy) ? orderBy : [orderBy];
  const arr = [...rows];
  arr.sort((a, b) => {
    for (const ob of list) {
      const [field, dir] = Object.entries(ob)[0];
      const av = a[field];
      const bv = b[field];
      if (av === bv) continue;
      if (av === undefined || av === null) return 1;
      if (bv === undefined || bv === null) return -1;
      const cmp = ticketAwareCompare(av, bv);
      if (cmp !== 0) return dir === "desc" ? -cmp : cmp;
    }
    return 0;
  });
  return arr;
}

// Числа — численно, строки — лексикографически (как делал бы Prisma/regexp).
function ticketAwareCompare(a, b) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}

function pick(data, allowed) {
  if (!allowed) return data;
  const out = {};
  for (const k of allowed) if (data[k] !== undefined) out[k] = data[k];
  return out;
}

// ---------- generic query builder ----------

function makeQuery(table) {
  const col = collections[table];
  const tbl = {
    findMany: async ({ where, include, orderBy, take } = {}) => {
      let rows = [...col.values()].filter((r) => matchesWhere(r, where));
      rows = orderRows(rows, orderBy);
      if (take) rows = rows.slice(0, take);
      return rows.map((r) => applyInclude(r, include));
    },
    findFirst: async ({ where, include, orderBy } = {}) => {
      let rows = [...col.values()].filter((r) => matchesWhere(r, where));
      rows = orderRows(rows, orderBy);
      return rows.length ? applyInclude(rows[0], include) : null;
    },
    findUnique: async ({ where, include } = {}) => {
      const [key, val] = Object.entries(where)[0];
      let rec = null;
      if (key === "id") rec = col.get(val);
      else rec = [...col.values()].find((r) => r[key] === val) || null;
      return rec ? applyInclude(rec, include) : null;
    },
    create: async ({ data, include }) => {
      const rec = withDefaults(table, { ...data }, { id: nextAutoId(col) });
      col.set(rec.id, rec);
      if (data.sizes && Array.isArray(data.sizes.create)) {
        data.sizes.create.forEach((s, i) => {
          const sizeRec = { ...s, id: nextAutoId(collections.size), productId: rec.id, sortOrder: s.sortOrder ?? i + 1 };
          collections.size.set(sizeRec.id, sizeRec);
        });
      }
      if (data.items && Array.isArray(data.items.create)) {
        data.items.create.forEach((it) => {
          const itemRec = { ...it, id: nextAutoId(collections.orderItem), orderId: rec.id };
          collections.orderItem.set(itemRec.id, itemRec);
        });
      }
      return applyInclude({ ...rec }, include);
    },
    update: async ({ where, data, include }) => {
      const id = where.id;
      const rec = col.get(id);
      if (!rec) {
        const err = new Error("Record not found");
        err.code = "P2025";
        throw err;
      }
      if (data.sizes) {
        const before = [...collections.size.values()].filter((s) => s.productId === id);
        for (const s of before) collections.size.delete(s.id);
        if (data.sizes.deleteMany) {
          // заменяем набор размеров целиком
          (data.sizes.create || []).forEach((s, i) => {
            collections.size.set(nextAutoId(collections.size), { ...s, id: nextAutoId(collections.size), productId: id, sortOrder: s.sortOrder ?? i + 1 });
          });
        } else if (data.sizes.create) {
          data.sizes.create.forEach((s, i) => {
            collections.size.set(nextAutoId(collections.size), { ...s, id: nextAutoId(collections.size), productId: id, sortOrder: s.sortOrder ?? i + 1 });
          });
        }
      }
      const cleanData = { ...data };
      delete cleanData.sizes;
      Object.assign(rec, cleanData);
      if (table === "order") rec.updatedAt = new Date();
      return applyInclude({ ...rec }, include);
    },
    upsert: async ({ where, update, create }) => {
      const [key, val] = Object.entries(where)[0];
      const existing = key === "id" ? col.get(val) : [...col.values()].find((r) => r[key] === val);
      if (existing) {
        Object.assign(existing, update);
        return { ...existing };
      }
      const rec = withDefaults(table, create, { id: nextAutoId(col) });
      col.set(rec.id, rec);
      return { ...rec };
    },
    updateMany: async ({ where, data }) => {
      let n = 0;
      for (const r of col.values()) {
        if (matchesWhere(r, where)) {
          Object.assign(r, data);
          n++;
        }
      }
      return { count: n };
    },
    delete: async ({ where }) => {
      const id = where.id;
      const rec = col.get(id);
      if (!rec) {
        const err = new Error("Record not found");
        err.code = "P2025";
        throw err;
      }
      if (table === "product") {
        for (const s of [...collections.size.values()]) if (s.productId === id) collections.size.delete(s.id);
      }
      if (table === "order") {
        for (const it of [...collections.orderItem.values()]) if (it.orderId === id) collections.orderItem.delete(it.id);
      }
      col.delete(id);
      return { ...rec };
    },
    deleteMany: async ({ where } = {}) => {
      let n = 0;
      for (const r of [...col.values()]) {
        if (matchesWhere(r, where)) {
          col.delete(r.id);
          n++;
        }
      }
      return { count: n };
    },
    count: async ({ where } = {}) => {
      return [...col.values()].filter((r) => matchesWhere(r, where)).length;
    },
    groupBy: async ({ by, _sum, _count }) => {
      const groups = new Map();
      for (const r of col.values()) {
        const key = by.map((b) => r[b]).join("|");
        if (!groups.has(key)) groups.set(key, {});
        const g = groups.get(key);
        for (const b of by) g[b] = r[b];
      }
      const out = [];
      for (const g of groups.values()) {
        const res = { ...g };
        if (_sum) {
          res._sum = {};
          for (const [f, flag] of Object.entries(_sum)) {
            res._sum[f] = [...col.values()].filter((r) => by.every((b) => r[b] === g[b])).reduce((a, r) => a + (r[f] || 0), 0);
          }
        }
        if (_count) {
          res._count = [...col.values()].filter((r) => by.every((b) => r[b] === g[b])).length;
        }
        out.push(res);
      }
      return out;
    },
  };
  return tbl;
}

function nextAutoId(col) {
  if (col.size === 0) return 1;
  let max = 0;
  for (const r of col.values()) if (Number(r.id) > max) max = Number(r.id);
  return max + 1;
}

export const dbMock = {
  setting: makeQuery("setting"),
  category: makeQuery("category"),
  product: makeQuery("product"),
  size: makeQuery("size"),
  option: makeQuery("option"),
  slide: makeQuery("slide"),
  order: makeQuery("order"),
  orderItem: makeQuery("orderItem"),
  // expose raw collections for introspection/tests
  _mock: collections,
};
