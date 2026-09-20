"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Icon from "./icons";
import AddToCartPanel from "./AddToCartPanel";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/lib/site.config";

const fmt = (n) => `${n} ${siteConfig.technical.currency}`;
const ADD_L = siteConfig.t.cart.add;

const ProductQuickAdd = ({ product, open, onClose, sizeId: initialSizeId }) => {
  const { items, add, setQty, openCart, options: ctxOptions } = useCart();
  const options = ctxOptions || [];
  const [sizeId, setSizeId] = useState(
    initialSizeId ?? (product.sizes[1] || product.sizes[0])?.id
  );
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("nobar");
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove("nobar");
    };
  }, [open]);

  if (!open) return null;

  const size = product.sizes.find((s) => s.id === sizeId) || product.sizes[0];
  const optionsTotal = selected.reduce(
    (a, id) => a + (options.find((o) => o.id === id)?.price || 0),
    0
  );
  const unitPrice = size.price + optionsTotal;
  const inCart = items.find(
    (i) =>
      i.productId === product.id &&
      i.sizeId === size.id &&
      JSON.stringify([...i.options.map((o) => o.id)].sort()) ===
        JSON.stringify([...selected].sort())
  );

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full md:max-w-2xl md:w-full h-[100svh] md:h-auto md:max-h-[92vh] flex flex-col overflow-hidden bg-cream neu-big md:rounded-[32px] rounded-none">
          <div className="shrink-0 flex items-center justify-between gap-3 px-5 pt-4 pb-3 bg-cream">
          <h3 className="h3 text-ink pr-3">{product.name}</h3>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-9 h-9 shrink-0 rounded-full bg-cream neu-xs flex items-center justify-center hover:text-primary transition"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <div className="relative w-full aspect-[16/10] bg-cream rounded-[24px] neu-inset-sm overflow-hidden mt-4">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                width={800}
                height={500}
              />
            ) : (
              <div className="w-24 h-24 rounded-[28px] bg-cream neu-inset-sm flex items-center justify-center absolute inset-0 m-auto">
                <Icon name={product.icon} className="w-12 h-12 text-primary" />
              </div>
            )}
          </div>

          <AddToCartPanel
            product={{ id: product.id, name: product.name, sizes: product.sizes, description: product.description }}
            options={options.map((o) => ({
              id: o.id,
              name: o.name,
              price: o.price,
              group: o.group,
            }))}
            sizeId={sizeId}
            setSizeId={setSizeId}
            selected={selected}
            setSelected={setSelected}
          />
          <div className="h-2" />
        </div>

        <div className="shrink-0 bg-cream px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
          <div className="flex items-center gap-3">
            {inCart ? (
              <>
                <div className="flex items-center gap-2 bg-cream rounded-full px-2 py-1.5 neu-xs">
                  <button
                    onClick={() => setQty(product.id, size.id, selected, inCart.quantity - 1)}
                    aria-label="Убавить"
                    className="w-10 h-10 rounded-full bg-cream text-ink neu-xs flex items-center justify-center hover:text-primary transition"
                  >
                    <Icon name="minus" className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-black">{inCart.quantity}</span>
                  <button
                    onClick={() => setQty(product.id, size.id, selected, inCart.quantity + 1)}
                    aria-label="Прибавить"
                    className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:brightness-110 transition neu-inset-sm"
                  >
                    <Icon name="plus" className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={openCart}
                  className="inline-flex items-center justify-center flex-1 py-3.5 min-h-[48px] bg-primary text-white rounded-full font-extrabold leading-none transition-all duration-300 hover:brightness-110 neu-inset-sm"
                >
                  <span className="leading-none translate-y-[0.5px]">В записи · {fmt(unitPrice * inCart.quantity)}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  add(product.id, size.id, selected);
                  toast.success(`${product.name} — в записи!`);
                  onClose();
                }}
                className="inline-flex items-center justify-center flex-1 py-3.5 min-h-[48px] bg-primary text-white rounded-full font-extrabold leading-none transition-all duration-300 hover:brightness-110 neu-inset-sm"
              >
                <span className="leading-none translate-y-[0.5px]">{ADD_L} · {fmt(unitPrice)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickAdd;
