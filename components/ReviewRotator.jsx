"use client";
import React from "react";
import Marquee from "react-fast-marquee";
import Icon from "./icons";

const Stars = ({ n = 5 }) => (
  <div className="flex gap-0.5 text-primary">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 24 24" className="w-4 h-4" fill={i < n ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9L12 3.5Z" strokeLinejoin="round" />
      </svg>
    ))}
  </div>
);

const clampText = (text, max = 200) => {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[.,;:!?]+$/, "") + "...";
};

const Card = ({ r }) => (
  <div className="bg-white rounded-3xl shadow-card p-6 md:p-7 flex flex-col gap-4 hover:shadow-lift transition-shadow duration-300 h-[300px]">
    <Stars n={Number(r.stars) || 5} />
    <div className="flex-1 min-h-0">
      <p className="text-[15px] text-ink leading-7 line-clamp-5">&laquo;{clampText(r.text)}&raquo;</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white border border-black/10 flex items-center justify-center text-primary-dark font-extrabold text-sm">
        <span className="translate-y-[0.5px]">{(r.name || "?").slice(0, 1)}</span>
      </div>
      <div>
        <p className="font-bold text-sm text-ink leading-none translate-y-[0.5px]">{r.name}</p>
        <p className="text-[11px] text-subtle mt-1">{r.source || "Яндекс Карты"}</p>
      </div>
    </div>
  </div>
);

const ReviewRotator = ({ reviews }) => {
  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 overflow-hidden py-2">
      <Marquee speed={80} gradient={false} pauseOnHover={false} direction="left">
        {reviews.map((r, i) => (
          <div
            key={i}
            className="shrink-0 w-[300px] sm:w-[340px] md:w-[360px] px-2 py-3"
          >
            <Card r={r} />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default ReviewRotator;
