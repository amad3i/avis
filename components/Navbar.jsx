"use client";
import React, { useState } from "react";
import Logo from "./Logo";
import Link from "next/link";
import Icon from "./icons";
import { useCart } from "@/context/CartContext";
import { getActiveStatus, statusMeta } from "@/lib/orderStatus";
import { siteConfig, fmt } from "@/lib/site.config";

const Navbar = ({ shop, phone, phoneHref, address, hoursWeekday, hoursWeekend }) => {
  const L = siteConfig.t.nav;
  const { count, openCart, orders, statuses } = useCart();
  const active = getActiveStatus(orders, statuses);
  const meta = active ? statusMeta(active) : null;
  const [infoOpen, setInfoOpen] = useState(false);
  const [pop, setPop] = useState(false);
  const prevCount = React.useRef(count);

  React.useEffect(() => {
    if (count > prevCount.current) {
      setPop(true);
      const t = setTimeout(() => setPop(false), 500);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  React.useEffect(() => {
    prevCount.current = count;
  }, [count]);

  return (
    <nav className="shrink-0 z-30 bg-cream">
      <div className="flex items-center justify-between px-4 md:px-10 lg:px-16 xl:px-28 py-3 gap-4">
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0 min-w-0">
          <Logo className="-mr-1 md:-mr-1.5" />
          <span className="font-black text-lg md:text-xl tracking-tight leading-none whitespace-nowrap text-primary translate-y-[0.5px]">
            {siteConfig.brand.shopName}
          </span>
        </div>

        <div className="flex items-center gap-6 lg:gap-8 max-md:hidden font-semibold text-sm leading-none">
          <Link href="/" className="text-ink hover:text-primary transition">
            {L.home}
          </Link>
          <Link href="/#menu" className="text-ink hover:text-primary transition">
            {L.menu}
          </Link>
          <Link href="/#reviews" className="text-ink hover:text-primary transition">
            {L.reviews}
          </Link>
          <Link href="/#contacts" className="text-ink hover:text-primary transition">
            {L.location}
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center">
            <a href={`tel:${phoneHref}`} className="flex items-center gap-1 font-extrabold text-ink text-sm leading-none">
              <Icon name="phone" className="w-3.5 h-3.5 text-primary" />
              <span className="leading-none translate-y-[0.5px]">{phone}</span>
            </a>
          </div>
          <div className="relative max-lg:hidden">
            <button onClick={() => setInfoOpen((v) => !v)} className="text-left leading-tight group">
              <p className="text-[11px] text-subtle font-semibold leading-none group-hover:text-primary transition flex items-center gap-1">
                <Icon name="clock" className="w-3 h-3" /><span className="leading-none translate-y-[0.5px]">{L.hours}</span>
              </p>
              <p className="font-extrabold text-ink text-sm leading-none group-hover:text-primary transition flex items-center gap-1.5">
                <Icon name="phone" className="w-3.5 h-3.5" />
                <span className="leading-none translate-y-[0.5px]">{phone}</span>
              </p>
            </button>
            {infoOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-cream neu-sm rounded-3xl p-5 text-sm space-y-3 z-50">
                <div className="flex gap-3">
                  <Icon name="clock" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-ink">{L.workingHours}</p>
                    <p className="text-subtle mt-0.5">{hoursWeekday.replace(/:00/g, "")}</p>
                    <p className="text-subtle">{hoursWeekend.replace(/:00/g, "")}</p>
                  </div>
                </div>
                <div className="flex gap-3 border-t border-black/5 pt-3">
                  <Icon name="pin" className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-ink">{L.address}</p>
                    <p className="text-subtle mt-0.5">{address}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={openCart}
            className={`relative max-md:hidden flex items-center gap-2.5 bg-primary text-white px-4 md:px-5 py-2.5 rounded-full transition-all duration-300 font-bold text-sm leading-none hover:brightness-110 neu-inset-sm ${pop ? "anim-cart-pop" : ""}`}
          >
            <Icon name="cart" className="w-[18px] h-[18px]" />
            <span className="max-sm:hidden leading-none">{L.cart}</span>
            {active ? (
              <span
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-primary text-white border-2 border-white"
                title={fmt(L.orderBadge + ": {label}", { label: meta.label })}
              >
                <Icon name={meta.icon} className="absolute inset-0 m-auto w-3.5 h-3.5" strokeWidth={2.4} style={{ width: 14, height: 14 }} />
              </span>
            ) : count > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-ink text-white text-xs font-black grid place-items-center leading-none border-2 border-white">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
