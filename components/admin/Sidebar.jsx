"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "../icons";
import Logo from "../Logo";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const AdminSidebar = ({ adminPath = "admin", kitchenPath = "kitchen" }) => {
  const router = useRouter();
  const { tab, setTab } = useAdminData();
  const [moreOpen, setMoreOpen] = useState(false);
  const A = siteConfig.t.admin;

  const select = (href, id) => {
    setTab(id);
    if (typeof window !== "undefined") window.history.replaceState(null, "", href);
  };

  const links = [
    { href: `/${adminPath}`, tab: "dashboard", label: A.dashboard, icon: "chart" },
    { href: `/${adminPath}/orders`, tab: "orders", label: A.orders, icon: "receipt" },
    { href: `/${adminPath}/products`, tab: "products", label: A.products, icon: "wrap" },
    { href: `/${adminPath}/categories`, tab: "categories", label: A.categories, icon: "box" },
    { href: `/${adminPath}/options`, tab: "options", label: A.options, icon: "plus" },
    { href: `/${adminPath}/slides`, tab: "slides", label: A.slides, icon: "image" },
    { href: `/${adminPath}/settings`, tab: "settings", label: A.settings, icon: "settings" },
  ];

  const mainItems = [links[0], links[1], links[2], links[6]];
  const moreItems = [links[3], links[4], links[5]];

  const logout = async () => {
    setMoreOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMoreOpen(false);
    if (moreOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moreOpen]);

  const isActive = (l) => tab === l.tab;

  return (
    <>
      {/* Мобильный топ-бар - только логотип */}
      <header className="md:hidden sticky top-0 z-40 bg-[#15171C] text-white border-b border-white/10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center gap-2.5 px-4 py-3">
          <Logo light />
          <span className="text-xs font-bold text-white/50 leading-tight whitespace-nowrap">
            {siteConfig.brand.shopName}
          </span>
        </div>
      </header>

      {/* Мобильный нижний таб-бар */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#15171C] text-white border-t border-white/10 grid grid-cols-5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {mainItems.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={(e) => {
              e.preventDefault();
              select(l.href, l.tab);
            }}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-extrabold transition ${
              isActive(l) ? "text-primary-light" : "text-white/55 hover:text-white"
            }`}
          >
            <Icon name={l.icon} className="w-5 h-5 shrink-0" />
            {l.label}
          </Link>
        ))}
        <button
          onClick={() => setMoreOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-extrabold text-white/55 hover:text-white transition"
        >
          <Icon name="plus" className="w-5 h-5 shrink-0" />
          {A.more}
        </button>
      </nav>

      {/* Мобильное меню "Ещё" */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] bg-black/50"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-[#15171C] text-white rounded-t-3xl p-4 pb-8 space-y-1 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="font-black text-sm">
                <span className="text-primary-light">{siteConfig.brand.logoText}</span>
                {siteConfig.brand.logoSubText ? ` · ${siteConfig.brand.logoSubText}` : ""} · {A.more}
              </p>
              <button
                onClick={() => setMoreOpen(false)}
                className="text-white/50 hover:text-white p-1"
                aria-label={A.close}
              >
                <Icon name="logout" className="w-5 h-5 rotate-45" />
              </button>
            </div>
            {moreItems.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault();
                  select(l.href, l.tab);
                  setMoreOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition ${
                  isActive(l) ? "bg-primary text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={l.icon} className="w-5 h-5 shrink-0" />
                {l.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <Icon name="home" className="w-5 h-5 shrink-0" />
              {A.openSite}
            </Link>
            <Link
              href={`/${kitchenPath}`}
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <Icon name="chef" className="w-5 h-5 shrink-0" />
              {A.kitchen}
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <Icon name="logout" className="w-5 h-5 shrink-0" />
              {A.logout}
            </button>
          </div>
        </div>
      )}

      <aside className="hidden md:flex w-60 shrink-0 bg-[#15171C] text-white flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Logo light />
            <span className="font-black text-lg tracking-tight leading-none text-white whitespace-nowrap translate-y-[0.5px]">
              {siteConfig.brand.shopName}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40 whitespace-nowrap">
            {A.panel}
          </p>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                select(l.href, l.tab);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                isActive(l) ? "bg-primary text-white" : "text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name={l.icon} className="w-5 h-5 shrink-0" />
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 space-y-1 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/55 hover:bg-white/10 hover:text-white transition"
          >
            <Icon name="home" className="w-5 h-5 shrink-0" />
            {A.openSite}
          </Link>
          <Link
            href={`/${kitchenPath}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/55 hover:bg-white/10 hover:text-white transition"
          >
            <Icon name="chef" className="w-5 h-5 shrink-0" />
            {A.kitchen}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-white/55 hover:bg-white/10 hover:text-white transition"
          >
            <Icon name="logout" className="w-5 h-5 shrink-0" />
            {A.logout}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
