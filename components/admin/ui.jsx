"use client";
import React from "react";
import Icon from "@/components/icons";
import { siteConfig } from "@/lib/site.config";

const A = siteConfig.t.admin;

export const Input = ({ label, className = "", ...props }) => (
  <div className={className}>
    {label && <label className="text-xs font-bold uppercase tracking-wide text-subtle block mb-1.5">{label}</label>}
    <input
      {...props}
      className="w-full border border-black/10 rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm outline-none focus:border-primary transition bg-white text-ink"
    />
  </div>
);

export const Textarea = ({ label, className = "", ...props }) => (
  <div className={className}>
    {label && <label className="text-xs font-bold uppercase tracking-wide text-subtle block mb-1.5">{label}</label>}
    <textarea
      {...props}
      className="w-full border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition bg-white text-ink resize-none"
    />
  </div>
);

export const Select = ({ label, className = "", children, ...props }) => (
  <div className={className}>
    {label && <label className="text-xs font-bold uppercase tracking-wide text-subtle block mb-1.5">{label}</label>}
    <select
      {...props}
      className="w-full border border-black/10 rounded-xl px-3.5 py-2.5 min-h-[44px] text-sm outline-none focus:border-primary transition bg-white text-ink"
    >
      {children}
    </select>
  </div>
);

export const Toggle = ({ label, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className="flex items-center gap-2.5 select-none"
  >
    <span
      className={`w-10 h-6 rounded-full relative transition ${checked ? "bg-primary" : "bg-black/15"}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[18px]" : "left-0.5"}`}
      />
    </span>
    <span className="text-sm font-semibold text-ink">{label}</span>
  </button>
);

export const Btn = ({ children, variant = "primary", className = "", ...props }) => {
  const styles = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    accent: "bg-primary hover:bg-primary-dark text-white",
    ghost: "bg-cream hover:bg-black/5 text-ink",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    outline: "border border-black/10 hover:border-primary hover:text-primary text-ink",
  };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-full text-sm font-extrabold leading-none translate-y-[0.5px] transition-all duration-300 disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Modal = ({ open, onClose, title, children, wide = false, footer = null }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl border border-black/10 w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden`}>
        <div className="shrink-0 bg-white flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/10 rounded-t-3xl z-10">
          <p className="font-extrabold text-ink text-lg">{title}</p>
          <button
            onClick={onClose}
            aria-label={A.close}
            className="w-9 h-9 rounded-full bg-cream hover:bg-black/5 transition flex items-center justify-center text-ink"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="shrink-0 bg-white border-t border-black/10">{footer}</div>}
      </div>
    </div>
  );
};

export const PageTitle = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
    <div>
      <h1 className="text-2xl font-black text-ink">{title}</h1>
      {subtitle && <p className="text-sm text-subtle mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const StatusBadge = ({ status }) => {
  const map = {
    new: { label: siteConfig.t.orderStatus.new, cls: "bg-blue-50 text-blue-600" },
    cooking: { label: siteConfig.t.orderStatus.cooking, cls: "bg-amber-50 text-amber-600" },
    ready: { label: siteConfig.t.orderStatus.ready, cls: "bg-primary-light text-primary-dark" },
    done: { label: siteConfig.t.orderStatus.done, cls: "bg-cream text-subtle" },
    canceled: { label: siteConfig.t.orderStatus.canceled, cls: "bg-red-50 text-red-500" },
  };
  const s = map[status] || map.new;
  return <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap ${s.cls}`}>{s.label}</span>;
};

export const Spinner = ({ size = 20, className = "" }) => (
  <span
    role="status"
    aria-label={A.loading}
    className={`inline-block animate-spin rounded-full border-2 border-primary/20 border-t-primary ${className}`}
    style={{ width: size, height: size }}
  />
);
