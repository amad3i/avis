"use client";
import React, { useState } from "react";
import AddToCartPanel from "./AddToCartPanel";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import Icon from "./icons";
import { siteConfig } from "@/lib/site.config";

const fmt = (n) => `${n} ${siteConfig.technical.currency}`;

export default function ProductAddToCart({ product, options = [] }) {
  const { add } = useCart();
  const ADD_L = siteConfig.t.cart.add;
  const [sizeId, setSizeId] = useState((product.sizes[1] || product.sizes[0])?.id);
  const [selected, setSelected] = useState([]);

  const size = product.sizes.find((s) => s.id === sizeId) || product.sizes[0];
  const optionsTotal = selected.reduce(
    (a, id) => a + (options.find((o) => o.id === id)?.price || 0),
    0
  );
  const unitPrice = size.price + optionsTotal;

  return (
    <div>
      <AddToCartPanel
        product={product}
        options={options}
        sizeId={sizeId}
        setSizeId={setSizeId}
        selected={selected}
        setSelected={setSelected}
      />
      <button
        onClick={() => {
          add(product.id, sizeId, selected);
          toast.success(`${product.name} — в записи!`);
        }}
        className="mt-6 w-full bg-primary text-white py-4 rounded-full font-extrabold leading-none transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2"
      >
        <span className="leading-none translate-y-[0.5px]">{ADD_L} · {fmt(unitPrice)}</span>
        <Icon name="arrowRight" className="w-4 h-4" />
      </button>
    </div>
  );
}
