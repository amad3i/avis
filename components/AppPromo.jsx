"use client";
import React from "react";
import Icon from "./icons";
import { usePWAInstall } from "@/components/PWA";
import { siteConfig, fmt } from "@/lib/site.config";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/lib/logo-paths";

const AppPromo = () => {
  const { install } = usePWAInstall();
  const L = siteConfig.t.promo;

  return (
    <div className="mt-20 md:mt-24 relative rounded-4xl overflow-hidden bg-ink">
      <div className="absolute inset-0 opacity-[.07] [background-image:radial-gradient(circle_at_20%_30%,white_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-12 px-7 md:px-14 py-10 md:py-14">
        <div className="flex-1 text-center md:text-left">
          <p className="text-primary font-extrabold uppercase tracking-[0.2em] text-xs">{fmt(L.eyebrow, { brand: siteConfig.brand.shopName })}</p>
          <h2 className="h2 text-white mt-3 max-w-md">{L.title}</h2>
          <p className="text-white/70 text-sm md:text-base mt-3 max-w-md leading-6">
            {L.text}
          </p>
          <button
            onClick={install}
            className="mt-7 inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-full font-extrabold hover:brightness-110 transition"
          >
            <Icon name="download" className="w-5 h-5" />
            <span className="translate-y-[0.8px]">{L.install}</span>
          </button>
        </div>
        <div className="shrink-0 relative hidden md:block">
          <div className="w-40 h-72 md:w-48 md:h-80 rounded-[2.2rem] border-[6px] border-black/70 bg-black shadow-2xl overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 will-change-transform transform-gpu backface-visibility-hidden">
              <div className="h-full bg-gradient-to-b from-[#23262E] to-[#1A1A2E] p-4 flex flex-col gap-3">
              <div className="w-8 h-1 bg-white/30 rounded-full mx-auto" />
              <div className="bg-white/10 rounded-xl h-16 flex items-center px-3 gap-2">
                <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center">
                  <svg viewBox={LOGO_VIEWBOX} className="w-[34px] h-[34px] text-primary" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
                    {LOGO_PATHS.map((p, i) => (
                      <path key={i} fillRule={p.fillRule} transform={p.transform} fill="currentColor" d={p.d} />
                    ))}
                  </svg>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="w-20 h-1.5 bg-white/40 rounded" />
                  <div className="w-12 h-1.5 bg-white/20 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/10 rounded-xl h-20" />
                ))}
              </div>
              <div className="mt-auto bg-primary rounded-full h-9 flex items-center justify-center">
                <div className="w-24 h-2 bg-white/60 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPromo;
