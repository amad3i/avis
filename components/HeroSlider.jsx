"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "./icons";
import { siteConfig, fmt } from "@/lib/site.config";

const isInternal = (h) => typeof h === "string" && (h.startsWith("/") || h.startsWith("#"));

const HeroSlider = ({ slides, scrim = true }) => {
  const hero = siteConfig.design.hero;
  const slideLabel = siteConfig.t.slidesLabel;
  const count = slides.length;
  const loop = count > 1 ? [...slides, slides[0]] : slides;

  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(true);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);

  const next = useCallback(() => setCurrent((c) => c + 1), []);

  // Ставим прокрутку на паузу, когда вкладка в фоне (иначе current "убегает")
  useEffect(() => {
    const onVis = () => {
      const isHidden = document.visibilityState === "hidden";
      setHidden(isHidden);
      if (!isHidden) setCurrent((c) => (c > count ? c % count : c));
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused || hidden) return;
    const t = setTimeout(() => setCurrent((c) => c + 1), hero.interval);
    return () => clearTimeout(t);
  }, [current, count, paused, hidden]);

  // Бесконечная лента: дошли до клона - через длительность перехода прыгаем на начало
  useEffect(() => {
    if (count < 2 || current !== count) return;
    const t = setTimeout(() => {
      setAnimating(false);
      setCurrent(0);
    }, hero.transition);
    return () => clearTimeout(t);
  }, [current, count]);

  useEffect(() => {
    if (!animating) {
      const r = requestAnimationFrame(() => setAnimating(true));
      return () => cancelAnimationFrame(r);
    }
  }, [animating]);

  if (!count) return null;

  return (
    <div
      className="relative w-full overflow-hidden bg-ink"
      style={{ height: hero.height, minHeight: hero.min, maxHeight: hero.max }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translate3d(-${current * 100}%, 0, 0)`,
          transition: animating ? `transform ${hero.transition}ms cubic-bezier(.77,0,.18,1)` : "none",
        }}
      >
        {loop.map((slide, index) => (
          <div key={index} className="relative min-w-full h-full overflow-hidden">
            {slide.image ? (
              <Image
                src={slide.image}
                alt={slide.title}
                className="object-cover object-center"
                fill
                sizes="100vw"
                priority={index === 0}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-dark to-ink" />
            )}

            {scrim && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/5" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25" />
              </>
            )}

            <div className="absolute inset-0 flex items-center">
              <div className="w-full px-5 md:px-14 xl:px-24 max-w-[1400px] mx-auto">
                <div className="inline-flex flex-col gap-0">
                  {slide.chip && (
                    <span
                      className="inline-flex items-center gap-2 text-white text-[11px] md:text-xs font-extrabold uppercase tracking-[0.2em]"
                      style={{ textShadow: "0 1px 10px rgba(0,0,0,0.65)" }}
                    >
                      <Icon name="sparkle" className="w-3.5 h-3.5 text-primary-light" />
                      {slide.chip}
                    </span>
                  )}
                  <h1
                    className="mt-5 max-w-3xl text-white font-black text-4xl md:text-6xl xl:text-7xl leading-[1.02] tracking-tight"
                  >
                    {slide.title}
                  </h1>
                  {slide.subtitle && (
                    <p className="mt-4 max-w-lg text-white/90 text-sm md:text-lg leading-relaxed">
                      {slide.subtitle}
                    </p>
                  )}
                  <div className="flex items-center flex-wrap gap-3 mt-8">
                    {slide.ctaText && (
                      isInternal(slide.ctaLink) ? (
                        <Link
                          href={slide.ctaLink}
                          className="group inline-flex items-center gap-2.5 md:px-9 px-7 md:py-4 py-3.5 bg-primary hover:brightness-110 rounded-full text-white font-extrabold text-base transition-colors duration-300"
                        >
                          {slide.ctaText}
                          <Icon name="arrowRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <a
                          href={slide.ctaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-2.5 md:px-9 px-7 md:py-4 py-3.5 bg-primary hover:brightness-110 rounded-full text-white font-extrabold text-base transition-colors duration-300"
                        >
                          {slide.ctaText}
                          <Icon name="arrowRight" className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )
                    )}
                    {slide.cta2Text && (
                      isInternal(slide.cta2Link) ? (
                        <Link
                          href={slide.cta2Link}
                          className="inline-flex items-center gap-1.5 px-7 md:px-9 py-3.5 md:py-4 rounded-full border-2 border-white/50 text-white font-extrabold text-base hover:bg-white/15 hover:border-white transition-colors duration-300"
                        >
                          {slide.cta2Text}
                        </Link>
                      ) : (
                        <a
                          href={slide.cta2Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-7 md:px-9 py-3.5 md:py-4 rounded-full border-2 border-white/50 text-white font-extrabold text-base hover:bg-white/15 hover:border-white transition-colors duration-300"
                        >
                          {slide.cta2Text}
                        </a>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute right-5 md:right-14 xl:right-24 bottom-5 md:bottom-6 flex items-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={fmt(slideLabel, { n: index + 1 })}
              className={`h-1.5 rounded-full cursor-pointer transition-all duration-500 ${
                current % count === index ? "w-7 bg-white" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroSlider;
