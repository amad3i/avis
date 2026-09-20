"use client";
import React from "react";
import Icon from "./icons";
import { sausageSizeLabel } from "@/lib/format";
import { siteConfig } from "@/lib/site.config";

const fmt = (n) => `${n} ${siteConfig.technical.currency}`;

const AddToCartPanel = ({ product, options = [], sizeId, setSizeId, selected, setSelected, description }) => {
  const isControlled = selected !== undefined && setSelected !== undefined;
  const [internalSelected, setInternalSelected] = React.useState([]);
  const [internalSizeId, setInternalSizeId] = React.useState(
    product.sizes?.length ? product.sizes[0].id : null
  );

  const sel = isControlled ? selected : internalSelected;
  const setSel = isControlled ? setSelected : setInternalSelected;
  const sid = sizeId !== undefined ? sizeId : internalSizeId;
  const setSid = setSizeId !== undefined ? setSizeId : setInternalSizeId;

  const toggleOption = (id) =>
    setSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const sauceOpts = options.filter((o) => (o.group || "addon") === "sauce");
  const addonOpts = options.filter((o) => (o.group || "addon") === "addon");

  const renderOption = (o) => {
    const active = sel.includes(o.id);
    return (
      <button
        key={o.id}
        type="button"
        onClick={() => toggleOption(o.id)}
        className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition ${
          active ? "bg-primary text-white neu-inset-sm" : "bg-cream text-subtle neu-xs hover:text-primary"
        }`}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <span
            className={`w-5 h-5 rounded-md flex items-center justify-center transition ${
              active ? "bg-white/25 text-white" : "bg-cream neu-inset-sm text-transparent"
            }`}
          >
            {active && <Icon name="check" className="w-3 h-3" strokeWidth={3} />}
          </span>
          {o.name}
        </span>
        <span className="font-bold">{o.price > 0 ? `+${fmt(o.price)}` : "-"}</span>
      </button>
    );
  };

  const renderSauce = (o) => {
    const active = sel.includes(o.id);
    return (
      <button
        key={o.id}
        type="button"
        onClick={() => toggleOption(o.id)}
        className={`px-3.5 py-2 rounded-full text-sm font-semibold transition ${
          active ? "bg-primary text-white neu-inset-sm" : "bg-cream text-subtle neu-xs hover:text-primary"
        }`}
      >
        {o.name}
      </button>
    );
  };

  return (
    <div>
      {description && (
        <div className="mb-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-subtle mb-1.5">О процедуре</p>
          <p className="text-sm text-subtle leading-6">{description}</p>
        </div>
      )}
      {product.sizes.length > 1 && (
        <div className="mt-7">
          <p className="text-xs font-extrabold uppercase tracking-wider text-subtle mb-3">Тариф</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s.id}
                onClick={() => setSid(s.id)}
                className={`px-4 py-2.5 rounded-2xl text-center transition ${
                  s.id === sid ? "bg-primary text-white neu-inset-sm" : "bg-cream text-subtle neu-xs hover:text-primary"
                }`}
              >
                <p className={`text-xs font-semibold ${s.id === sid ? "text-white" : "text-subtle"}`}>
                  {sausageSizeLabel(s.label, product.category?.name)}
                </p>
                <p className={`font-extrabold ${s.id === sid ? "text-white" : "text-ink"}`}>{fmt(s.price)}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {sauceOpts.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-subtle mb-3">
            Доп. услуги <span className="font-normal lowercase tracking-normal text-subtle/70">· можно несколько</span>
          </p>
          <div className="flex flex-wrap gap-2">{sauceOpts.map(renderSauce)}</div>
        </div>
      )}

      {addonOpts.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-extrabold uppercase tracking-wider text-subtle mb-3">
            К приёму
          </p>
              <div className="grid sm:grid-cols-2 gap-2">{addonOpts.map(renderOption)}</div>
        </div>
      )}
    </div>
  );
};

export default AddToCartPanel;
