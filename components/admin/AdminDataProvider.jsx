"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const AdminDataContext = createContext(null);
export const useAdminData = () => useContext(AdminDataContext);

const RESOURCES = [
  { key: "products", url: "/api/products", pick: (j) => j.products || [] },
  { key: "categories", url: "/api/categories", pick: (j) => j.categories || [] },
  { key: "options", url: "/api/options?all=1", pick: (j) => j.options || [] },
  { key: "slides", url: "/api/slides", pick: (j) => j.slides || [] },
  { key: "settings", url: "/api/settings", pick: (j) => j.settings || {} },
  { key: "analytics", url: "/api/analytics", pick: (j) => j },
  { key: "orders", url: "/api/orders?status=all", pick: (j) => j.orders || [] },
];

const ROUTES = [
  "/admin",
  "/admin/orders",
  "/admin/products",
  "/admin/categories",
  "/admin/options",
  "/admin/slides",
  "/admin/settings",
];

const TAB_FROM_PATH = (p) => {
  if (!p) return "dashboard";
  if (p.endsWith("/orders")) return "orders";
  if (p.endsWith("/products")) return "products";
  if (p.endsWith("/categories")) return "categories";
  if (p.endsWith("/options")) return "options";
  if (p.endsWith("/slides")) return "slides";
  if (p.endsWith("/settings")) return "settings";
  return "dashboard";
};

export default function AdminDataProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState({
    products: [],
    categories: [],
    options: [],
    slides: [],
    settings: {},
    analytics: null,
    orders: [],
  });
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState(() => TAB_FROM_PATH(pathname));

  const load = async () => {
    try {
      const results = await Promise.all(
        RESOURCES.map((r) => fetch(r.url).then((res) => res.json()).catch(() => null))
      );
      const next = {};
      RESOURCES.forEach((r, i) => {
        next[r.key] = r.pick(results[i] || {});
      });
      setData((d) => ({ ...d, ...next }));
    } catch {}
    setLoaded(true);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    ROUTES.forEach((r) => router.prefetch(r));
  }, [router]);

  useEffect(() => {
    const es = new EventSource("/api/events");
    let scheduled = false;
    es.onmessage = (e) => {
      let type;
      try {
        type = JSON.parse(e.data).type;
      } catch {
        return;
      }
      if (type !== "orders") return;
      if (scheduled) return;
      scheduled = true;
      setTimeout(async () => {
        scheduled = false;
        try {
          const [a, o] = await Promise.all([
            fetch("/api/analytics").then((r) => r.json()),
            fetch("/api/orders?status=all").then((r) => r.json()),
          ]);
          setData((d) => ({ ...d, analytics: a, orders: o.orders || [] }));
        } catch {}
      }, 1000);
    };
    return () => es.close();
  }, []);

  const patch = (key, updater) =>
    setData((d) => ({ ...d, [key]: typeof updater === "function" ? updater(d[key]) : updater }));

  const value = {
    data,
    loaded,
    tab,
    setTab,
    reload: load,
    setProducts: (v) => patch("products", v),
    setCategories: (v) => patch("categories", v),
    setOptions: (v) => patch("options", v),
    setSlides: (v) => patch("slides", v),
    setSettings: (v) => patch("settings", v),
    setAnalytics: (v) => patch("analytics", v),
    setOrders: (v) => patch("orders", v),
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
