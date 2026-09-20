"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site.config";
import LogoIcon from "./LogoIcon";

// Логотип бренда: единый для сайта, админки и кухни.
//   brand.logoImage = "/logo.svg"  → инлайновый SVG (перекрашивается через text-primary)
//   brand.logoImage = "/my.png"    → <img> как есть
//   brand.logoImage = ""           → текстовый логотип (logoText / logoSubText)
//
// Настраивается в lib/site.config.js → brand.
const Logo = ({ light = false, className = "" }) => {
  const router = useRouter();
  const { logoImage, logoText, logoSubText } = siteConfig.brand;

  // SVG-логотип: рендерим инлайном, чтобы currentColor подхватывал акцент.
  const isSvg = logoImage && logoImage.endsWith(".svg");

  return (
    <div
      onClick={() => {
        router.push("/");
        scrollTo(0, 0);
      }}
      className={`flex items-center cursor-pointer select-none ${className}`}
    >
      {isSvg ? (
        // Инлайновый SVG (текущий логотип бренда) — цвет = text-primary.
        // Бокс компактный (36/40px), внутренние отступы обрезаны в LogoIcon.
        <LogoIcon
          className={`w-9 h-9 md:w-10 md:h-10 text-primary ${light ? "brightness-150" : ""}`}
        />
      ) : logoImage ? (
        // Растровый логотип (PNG/JPG/WebP).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoImage}
          alt={logoText || "Логотип"}
          className={`h-9 md:h-10 w-auto max-w-[140px] object-contain ${light ? "brightness-150" : ""}`}
        />
      ) : (
        // Текстовый логотип (две строки).
        <div className="leading-none">
          {logoText && (
            <p className={`font-black text-base md:text-lg tracking-tighter ${light ? "text-white" : "text-ink"}`}>
              {logoText}
            </p>
          )}
          {logoSubText && (
            <p className="font-black text-base md:text-lg tracking-tighter text-primary">
              {logoSubText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
