"use client";
import React, { useEffect, useState } from "react";
import { usePWAInstall } from "@/components/PWA";
import Icon from "@/components/icons";
import { siteConfig } from "@/lib/site.config";

const InstallBanner = () => {
  const { install, installed } = usePWAInstall();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || installed) return null;

  return (
    <div className="md:hidden bg-primary text-white">
      <button
        onClick={install}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-base font-extrabold active:scale-[.99] transition-transform"
      >
        <Icon name="download" className="w-5 h-5" strokeWidth={2.4} />
        <span>{siteConfig.t.promo.title}</span>
      </button>
    </div>
  );
};

export default InstallBanner;
