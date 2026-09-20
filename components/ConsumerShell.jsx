"use client";
import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import BottomTabBar from "./BottomTabBar";
import InstallBanner from "./InstallBanner";
import Navbar from "./Navbar";

const ConsumerShell = ({
  children,
  shop,
  phone,
  phoneHref,
  address,
  hoursWeekday,
  hoursWeekend,
}) => {
  const pathname = usePathname() || "/";

  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/panel");
  const isKitchen = pathname.startsWith("/kitchen");
  const hideChrome = isAdmin || isKitchen;

  // Блокируем скролл документа ТОЛЬКО на витрине, чтобы <main> был единственным
  // скроллером (убирает «удвоенный»/инерционный скролл на тачпаде и телефоне).
  // Админ/кухня используют документный скролл — их не трогаем.
  useEffect(() => {
    if (hideChrome) return;
    const root = document.documentElement;
    root.classList.add("scroll-locked");
    return () => root.classList.remove("scroll-locked");
  }, [hideChrome]);

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-cream">
      <InstallBanner />
      <Navbar
        shop={shop}
        phone={phone}
        phoneHref={phoneHref}
        address={address}
        hoursWeekday={hoursWeekday}
        hoursWeekend={hoursWeekend}
      />
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain touch-pan-y pb-28 md:pb-6">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
};

export default ConsumerShell;
