"use client";
import React from "react";
import Icon from "./icons";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Да",
  cancelLabel = "Отмена",
  confirmClassName = "bg-red-500 hover:bg-red-600 text-white",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-3xl border border-black/10 shadow-drawer w-full max-w-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Icon name="x" className="w-7 h-7" strokeWidth={2.5} />
        </div>
        <p className="font-extrabold text-lg text-ink mt-4">{title}</p>
        {description && <p className="text-sm text-subtle mt-2 leading-6">{description}</p>}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-cream hover:bg-black/5 text-ink font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 font-extrabold py-3 rounded-xl transition disabled:opacity-50 ${confirmClassName}`}
          >
            {loading ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
