"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Icon from "@/components/icons";
import { getActiveStatus, statusMeta } from "@/lib/orderStatus";
import { siteConfig, fmt } from "@/lib/site.config";

const L = siteConfig.t;

const navItems = [
  { key: "home", label: L.nav.home, icon: "home", href: "/" },
  { key: "menu", label: L.nav.menu, icon: "tooth", href: "/#menu" },
  { key: "contacts", label: L.nav.contacts, icon: "pin", href: "/#contacts" },
];

const BottomTabBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { count, openCart, orders, statuses } = useCart();
  const active = getActiveStatus(orders, statuses);
  const meta = active ? statusMeta(active) : null;
  const [activeKey, setActiveKey] = useState("home");
  const rafRef = useRef(0);

  // scroll-spy: подсветка раздела в зависимости от позиции скролла
  useEffect(() => {
    if (pathname !== "/") {
      setActiveKey("");
      return;
    }

    const compute = () => {
      // menu и reviews -> "menu", contacts -> "contacts", верх (hero) -> "home"
      let key = "home";
      for (const id of ["menu", "reviews", "contacts"]) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= 160) {
          key = id === "contacts" ? "contacts" : "menu";
        }
      }
      setActiveKey(key);
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pathname]);

  const go = (href) => {
    if (href === "cart") {
      openCart();
      return;
    }
    if (href.startsWith("/#")) {
      if (pathname === "/") {
        const id = href.replace("/", "");
        const el = document.querySelector(id);
        if (el) {
          el.scrollIntoView({ block: "start" });
          return;
        }
      }
      router.push(href);
    } else {
      router.push(href);
    }
  };

  const isActive = (it) => activeKey === it.key;

  return (
    <nav
      aria-label={L.nav.ariaBottom}
      data-bottom-bar
      className="md:hidden fixed bottom-0 inset-x-0 z-50 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] px-4"
    >
      <div className="relative flex items-center">
        <div className="flex-1 mr-[calc(54px-clamp(10px,4vw,15px))] bg-cream neu rounded-[24px] h-16 grid grid-cols-3 items-center pr-[50px]">
        {navItems.map((it) => {
          const active = isActive(it);
          return (
            <button
              key={it.key}
              onClick={() => go(it.href)}
              aria-label={it.label}
              aria-current={active ? "page" : undefined}
              className="relative flex items-center justify-center active:scale-90 transition-transform duration-150"
            >
              <span
                className={`flex items-center justify-center rounded-2xl transition-all duration-300 ${
                  active ? "w-12 h-12 bg-primary/10" : "w-12 h-12"
                }`}
              >
                <Icon
                  name={it.icon}
                  className={`w-[26px] h-[26px] transition-colors ${
                    active ? "text-primary" : "text-ink/55"
                  }`}
                  strokeWidth={active ? 2.4 : 1.7}
                />
              </span>
            </button>
          );
        })}
        </div>

        {/* Корзина - плавающая кнопка справа, плашка доходит до её середины */}
        <button
          onClick={() => go("cart")}
          aria-label={L.nav.cart}
          className="absolute right-[calc(11px-clamp(10px,4vw,15px))] top-1/2 -translate-y-1/2 z-10 flex items-center justify-center active:scale-90 transition-transform duration-150"
        >
          <span className="relative flex items-center justify-center w-[77px] h-[77px] rounded-full bg-primary text-white shadow-cta">
            <Icon name="cart" className="w-8 h-8" strokeWidth={2.2} />
            {active ? (
              <span
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-primary text-white border-2 border-white"
                title={fmt(L.nav.orderBadge + ": {label}", { label: meta.label })}
              >
                <Icon name={meta.icon} className="absolute inset-0 m-auto w-4 h-4" strokeWidth={2.4} style={{ width: 16, height: 16 }} />
              </span>
            ) : count > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 min-w-[24px] h-[24px] px-1.5 bg-ink text-white text-xs font-black rounded-full grid place-items-center leading-none translate-y-[0.5px] ring-2 ring-white">
                {count}
              </span>
            ) : null}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomTabBar;
