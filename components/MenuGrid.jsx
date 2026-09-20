"use client";
import React, { useState } from "react";
import ProductCard from "./ProductCard";
import Icon from "./icons";
import { siteConfig } from "@/lib/site.config";

const MenuGrid = ({ categories, products, showAllChip = true, sticky = false, imageAspect = "aspect-[4/3]", gridTopMargin = "mt-7" }) => {
  const [active, setActive] = useState(showAllChip ? "all" : (categories[0]?.id || "all"));
  const L = siteConfig.t.menuSection;

  const filtered =
    active === "all" ? products : products.filter((p) => p.categoryId === active);

  const chipCls = (isActive) =>
    `shrink-0 inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-full text-sm font-bold leading-none transition-all duration-300 ${
      isActive
        ? "bg-primary text-white neu-inset-sm"
        : "bg-cream text-ink neu-xs hover:text-primary"
    }`;

  return (
    <div>
      <div
        className={`flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap ${
          sticky ? "sticky top-[104px] md:top-[68px] z-30 py-3 bg-cream/90 backdrop-blur-xl" : ""
        }`}
      >
        {showAllChip && (
          <button onClick={() => setActive("all")} className={chipCls(active === "all")}>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="grid" className="w-4 h-4" />
              <span className="leading-none">{L.all}</span>
            </span>
          </button>
        )}
        {categories.map((c) => (
          <button key={c.id} onClick={() => setActive(c.id)} className={chipCls(active === c.id)}>
            <span className="inline-flex items-center gap-1.5">
              <Icon name={c.icon} className="w-4 h-4 shrink-0" />
              <span className="leading-none">{c.name}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7 ${gridTopMargin}`}>
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} imageAspect={imageAspect} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-subtle py-16">{L.empty}</p>
      )}
    </div>
  );
};

export default MenuGrid;
