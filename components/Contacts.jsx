import React from "react";
import Icon from "./icons";
import Map from "./Map";
import { getSettings } from "@/lib/data";
import { siteConfig, fmt } from "@/lib/site.config";

const Contacts = async () => {
  const s = await getSettings();
  const L = siteConfig.t.contacts;

  return (
    <section id="contacts" className="mt-16 md:mt-20 scroll-mt-20">
      <div className="grid lg:grid-cols-2 gap-6 items-stretch">
        <div className="relative bg-primary rounded-4xl overflow-hidden px-6 md:px-10 py-9 text-white flex flex-col">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/15 blur-2xl pointer-events-none" />

          <div className="relative">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-white/60">{L.eyebrow}</p>
            <h2 className="text-2xl md:text-4xl font-black leading-tight mt-2">{s.shopName}</h2>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-white/80 flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white" aria-hidden="true">
                      <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.09L2.5 9.27l6.6-1.01L12 2z" />
                    </svg>
                    <span className="font-semibold text-white">{s.yandexRating}</span>
                    {fmt(L.yandexLine, { n: s.yandexReviewCount })}
                  </p>
                  <p className="text-sm text-white/80 flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white" aria-hidden="true">
                      <path d="M12 2l2.9 6.26L21.5 9.27l-4.75 4.64L17.9 21 12 17.27 6.1 21l1.15-7.09L2.5 9.27l6.6-1.01L12 2z" />
                    </svg>
                    <span className="font-semibold text-white">{s.rating}</span>
                    {fmt(L.gisLine, { n: s.reviewCount })}
                  </p>
                </div>
          </div>

          <div className="relative mt-8 space-y-5 flex-1">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-white">
                <Icon name="pin" className="w-5 h-5" />
              </div>
              <div className="-mt-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">{L.address}</p>
                <p className="font-semibold text-sm leading-5 mt-0.5">{s.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-white">
                <Icon name="clock" className="w-5 h-5" />
              </div>
              <div className="-mt-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">{L.hours}</p>
                <p className="font-semibold text-sm leading-5 mt-0.5">
                  {s.hoursWeekday}
                  <br />
                  {s.hoursWeekend}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 text-white">
                <Icon name="phone" className="w-5 h-5" />
              </div>
              <div className="-mt-0.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">{L.phoneOrder}</p>
                <a href={`tel:${s.phoneHref}`} className="font-extrabold text-xl hover:underline mt-0.5 inline-block">
                  {s.phone}
                </a>
              </div>
            </div>
          </div>

          <div className="relative flex flex-wrap gap-2.5 mt-8">
            <a
              href={s.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/25 text-white rounded-full font-extrabold text-sm leading-none hover:bg-white hover:text-primary active:scale-95 transition"
            >
              <Icon name="route" className="w-4 h-4" />
              <span className="leading-none translate-y-[0.5px]">{L.route}</span>
            </a>
          </div>
        </div>

        <Map lat={parseFloat(s.mapLat || "52.535666")} lng={parseFloat(s.mapLng || "85.19553")} zoom={parseInt(s.mapZoom || "16")} name={s.shopName} logo={s.logo} mapsUrl={s.mapsUrl} gisUrl={s.gisUrl} />
      </div>
    </section>
  );
};

export default Contacts;
