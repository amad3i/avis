"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Icon from "./icons";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/lib/site.config";
import ProductQuickAdd from "./ProductQuickAdd";

const ADD_L = siteConfig.t.cart.add;

const ProductCard = ({ product, imageAspect = "aspect-[4/3]" }) => {
  const { items, setQty } = useCart();
  const router = useRouter();
  const [sizeId, setSizeId] = useState((product.sizes[1] || product.sizes[0])?.id);
  const [modalOpen, setModalOpen] = useState(false);

  if (!product.sizes.length) return null;

  const size = product.sizes.find((s) => s.id === sizeId) || product.sizes[0];
  const inCart = items.find((i) => i.productId === product.id && i.sizeId === size.id);
  const hasSizes = product.sizes.length > 1;
  const zoom = product.zoom || 1;
  const fit = product.fit || "contain";
  const rotate = product.rotate || 0;
  const imgStyle = {};
  if (zoom !== 1) imgStyle.transform = `scale(${zoom})`;
  if (rotate) imgStyle.transform = `${imgStyle.transform || ""} rotate(${rotate}deg)`.trim();

  const handleAdd = (e) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  return (
    <>
    <div
      onClick={() => { router.push("/product/" + product.id); }}
      className="flex flex-col group neu-card rounded-[24px] cursor-pointer overflow-hidden"
    >
      <div className={`relative bg-cream w-full ${imageAspect} overflow-hidden`}>
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            className={`transition duration-500 w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"}`}
            style={Object.keys(imgStyle).length ? imgStyle : undefined}
            width={600}
            height={450}
          />
        ) : (
          <div className="w-24 h-24 rounded-[28px] bg-cream neu-inset-sm flex items-center justify-center absolute inset-0 m-auto">
            <Icon name={product.icon} className="w-12 h-12 text-primary" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.isNew && (
            <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">
              New
            </span>
          )}
          {product.hit && (
            <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">
              Хит
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 p-4 md:p-5 flex-1 min-w-0">
        <p className="font-bold text-ink leading-snug">{product.name}</p>
        <div className="flex-1 min-h-0">
          <p className="text-small text-subtle line-clamp-2">{product.description}</p>
        </div>

        {hasSizes && (
          <div className="flex flex-wrap gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
            {product.sizes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSizeId(s.id)}
                className={`inline-flex items-center justify-center px-3 py-1.5 min-h-[32px] rounded-full text-[11px] font-bold leading-none transition ${
                  s.id === size.id
                    ? "bg-primary text-white neu-inset-sm"
                    : "bg-cream text-subtle neu-xs hover:text-primary"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 w-full mt-3 min-w-0" onClick={(e) => e.stopPropagation()}>
          <p className="text-lg font-extrabold text-ink whitespace-nowrap basis-full text-center sm:basis-auto sm:text-left">{formatPrice(size.price)}</p>
          {inCart ? (
            <div className="flex items-center justify-between w-full sm:w-auto sm:gap-1.5 sm:justify-start">
              <button
                onClick={() => setQty(product.id, inCart.size.id, inCart.options.map((o) => o.id), inCart.quantity - 1)}
                aria-label="Убавить"
                className="w-9 h-9 shrink-0 rounded-full bg-cream text-ink neu-xs flex items-center justify-center hover:text-primary transition"
              >
                <Icon name="minus" className="w-3.5 h-3.5" />
              </button>
              <span className="w-5 text-center font-extrabold text-sm">{inCart.quantity}</span>
              <button
                onClick={() => setQty(product.id, inCart.size.id, inCart.options.map((o) => o.id), inCart.quantity + 1)}
                aria-label="Прибавить"
                className="w-9 h-9 shrink-0 rounded-full bg-primary hover:brightness-110 text-white flex items-center justify-center transition neu-inset-sm"
              >
                <Icon name="plus" className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              aria-label={ADD_L}
              className="w-full sm:w-auto inline-flex items-center justify-center h-9 px-4 bg-primary hover:brightness-110 text-white rounded-full text-xs font-extrabold leading-none transition-all duration-300 whitespace-nowrap shrink-0 neu-inset-sm"
            >
              <span className="leading-none translate-y-[0.5px]">{ADD_L}</span>
            </button>
          )}
        </div>
      </div>
    </div>
    <ProductQuickAdd product={product} open={modalOpen} sizeId={sizeId} onClose={() => setModalOpen(false)} />
  </>
  );
};

export default ProductCard;
