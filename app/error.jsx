"use client";

import React from "react";

export default function GlobalError({ reset }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-4">
      <div className="w-16 h-16 rounded-[22px] bg-cream neu flex items-center justify-center text-red-500">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h1 className="text-2xl font-black text-ink">Что-то пошло не так</h1>
      <p className="text-subtle text-sm max-w-sm leading-6">
        Мы уже знаем об этом. Попробуйте обновить страницу — или запишитесь на приём по телефону.
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-full font-extrabold transition"
      >
        Попробовать снова
      </button>
    </div>
  );
}