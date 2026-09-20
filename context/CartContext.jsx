'use client'
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { siteConfig } from "@/lib/site.config";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const STORAGE_KEY = `${siteConfig.technical.storagePrefix}-cart`;
const ORDERS_KEY = `${siteConfig.technical.storagePrefix}-orders`;

const itemKey = (productId, sizeId, optionIds) =>
  `${productId}:${sizeId}:${[...(optionIds || [])].sort((a, b) => a - b).join("-")}`;

export const CartProvider = ({ products, options = [], children }) => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("cart");
  const [lastOrder, setLastOrder] = useState(null);
  const [lastToken, setLastToken] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
      const ord = sessionStorage.getItem(ORDERS_KEY);
      if (ord) {
        let parsed = JSON.parse(ord);
        if (parsed && !Array.isArray(parsed)) parsed = [parsed];
        const valid = parsed.filter((p) => p && p.id && p.token);
        if (valid.length) {
          setOrders(valid);
          setLastOrder(valid[valid.length - 1].id);
          setLastToken(valid[valid.length - 1].token);
        }
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const productById = useMemo(() => {
    const map = {};
    for (const p of products) map[p.id] = p;
    return map;
  }, [products]);

  const optionById = useMemo(() => {
    const map = {};
    for (const o of options) map[o.id] = o;
    return map;
  }, [options]);

  const add = (productId, sizeId, optionIds = [], qty = 1) => {
    const key = itemKey(productId, sizeId, optionIds);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.key === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
        return next;
      }
      return [...prev, { key, productId, sizeId, optionIds: [...optionIds], quantity: qty }];
    });
  };

  const setQty = (productId, sizeId, optionIds, quantity) => {
    const key = itemKey(productId, sizeId, optionIds);
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity } : i))
    );
  };

  const clear = () => setItems([]);

  const detailed = useMemo(
    () =>
      items
        .map((i) => {
          const p = productById[i.productId];
          if (!p) return null;
          const size = p.sizes.find((s) => s.id === i.sizeId) || p.sizes[0];
          if (!size) return null;
          const opts = (i.optionIds || []).map((id) => optionById[id]).filter(Boolean);
          const optionsTotal = opts.reduce((a, o) => a + o.price, 0);
          return {
            ...i,
            product: p,
            size,
            options: opts,
            unitPrice: size.price + optionsTotal,
            sum: (size.price + optionsTotal) * i.quantity,
          };
        })
        .filter(Boolean),
    [items, productById, optionById]
  );

  const count = useMemo(() => items.reduce((acc, i) => acc + i.quantity, 0), [items]);
  const total = useMemo(() => detailed.reduce((acc, i) => acc + i.sum, 0), [detailed]);

  const openCart = () => {
    setView("cart");
    setOpen(true);
  };

  const placeOrderSuccess = (number, token) => {
    setLastOrder(number);
    setLastToken(token);
    setView("success");
    clear();
    try {
      setOrders((prev) => {
        const next = [...prev.filter((o) => o.id !== number), { id: number, token }];
        sessionStorage.setItem(ORDERS_KEY, JSON.stringify(next));
        return next;
      });
    } catch {}
  };

  const removeOrder = useCallback((id) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== id);
      try {
        sessionStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setLastOrder((prev) => (prev === id ? null : prev));
    setLastToken((prev) => (prev === id ? null : prev));
  }, []);

  const clearFinishedOrders = useCallback(() => {
    const finished = new Set();
    for (const [id, d] of Object.entries(statuses)) {
      if (d && (d.status === "done" || d.status === "canceled")) finished.add(Number(id));
    }
    if (finished.size === 0) return;
    setOrders((prev) => {
      const next = prev.filter((o) => !finished.has(Number(o.id)));
      try {
        sessionStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setStatuses((prev) => {
      const next = { ...prev };
      for (const id of finished) delete next[id];
      return next;
    });
  }, [statuses]);

  useEffect(() => {
    if (orders.length === 0) {
      setStatuses({});
      return;
    }
    let cancelled = false;
    const fetchAll = async () => {
      const entries = await Promise.all(
        orders.map(async (o) => {
          try {
            const res = await fetch(
              `/api/orders/${o.id}/status?token=${encodeURIComponent(o.token)}`,
              { cache: "no-store" }
            );
            if (!res.ok) return [o.id, null];
            const d = await res.json();
            return [o.id, d];
          } catch {
            return [o.id, null];
          }
        })
      );
      if (cancelled) return;
      const map = {};
      for (const [id, d] of entries) {
        if (d) map[id] = d;
      }
      setStatuses(map);
    };
    fetchAll();
    const t = setInterval(fetchAll, 8000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [orders, removeOrder]);

  return (
    <CartContext.Provider
      value={{
        products, productById, options,
        items: detailed, add, setQty, clear,
        count, total,
        open, setOpen, openCart,
        view, setView, lastOrder, lastToken, orders, statuses, placeOrderSuccess, removeOrder, clearFinishedOrders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
