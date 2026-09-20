import React from "react";
import Link from "next/link";
import Logo from "./Logo";
import Icon from "./icons";
import { getSettings } from "@/lib/data";
import { siteConfig } from "@/lib/site.config";

const Footer = async () => {
  const s = await getSettings();
  const L = siteConfig.t.footer;
  const nav = siteConfig.t.nav;

  return (
    <footer className="text-ink mt-12 md:mt-24">
      <div className="grid grid-cols-2 md:flex md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-6 md:gap-10 pt-8 md:pt-14 pb-[75px] md:pb-14 border-t border-black/5">
        <div className="col-span-2 md:w-4/5 md:max-w-sm">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="font-black text-lg md:text-xl tracking-tight leading-none whitespace-nowrap text-primary translate-y-[0.5px]">{s.shopName}</span>
          </div>
          <p className="mt-4 md:mt-5 text-sm leading-6 text-subtle">
            {s.slogan} {L.tagline}
          </p>
          <div className="hidden md:flex flex-wrap justify-start gap-2 -ml-1 mt-2 md:mt-3">
            <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="text-primary hover:text-primary-dark transition-colors flex items-center justify-center">
              <Icon name="instagram" className="w-9 h-9" />
            </a>
            <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Яндекс Карты"
              className="-ml-1 text-primary hover:text-primary-dark transition-colors flex items-center justify-center">
              <Icon name="yandex" className="w-9 h-9" />
            </a>
            <a href={s.gisUrl} target="_blank" rel="noopener noreferrer" aria-label="2ГИС"
              className="text-primary hover:text-primary-dark transition-colors flex items-center justify-center">
              <Icon name="2gis" className="h-7 w-auto" />
            </a>
            {s.vkLink && (
              <a href={s.vkLink} target="_blank" rel="noopener noreferrer" aria-label="VK"
                className="w-10 h-10 rounded-xl bg-cream hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-ink font-black text-xs">
                VK
              </a>
            )}
          </div>
        </div>

        <div className="md:w-1/2 flex items-start md:items-center md:justify-center">
          <div>
            <h2 className="font-bold text-ink mb-3 md:mb-5">{L.sections}</h2>
            <ul className="text-sm space-y-2">
              <li><Link href="/" className="hover:text-primary transition">{nav.home}</Link></li>
              <li><Link href="/#menu" className="hover:text-primary transition">{nav.menu}</Link></li>
              <li><Link href="/#reviews" className="hover:text-primary transition">{nav.reviews}</Link></li>
              <li>
                <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                  {L.onMap}
                </a>
              </li>
            </ul>
            <div className="md:hidden flex flex-wrap justify-start gap-2 -ml-1 mt-2 md:mt-5">
              <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="text-primary hover:text-primary-dark transition-colors flex items-center justify-center">
                <Icon name="instagram" className="w-9 h-9" />
              </a>
              <a href={s.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Яндекс Карты"
                className="-ml-1 text-primary hover:text-primary-dark transition-colors flex items-center justify-center">
                <Icon name="yandex" className="w-9 h-9" />
              </a>
              <a href={s.gisUrl} target="_blank" rel="noopener noreferrer" aria-label="2ГИС"
                className="text-primary hover:text-primary-dark transition-colors flex items-center justify-center">
                <Icon name="2gis" className="h-7 w-auto" />
              </a>
              {s.vkLink && (
                <a href={s.vkLink} target="_blank" rel="noopener noreferrer" aria-label="VK"
                  className="w-10 h-10 rounded-xl bg-cream hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-ink font-black text-xs">
                  VK
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="md:w-1/2 flex items-start md:items-center md:justify-center">
          <div>
            <h2 className="font-bold text-ink mb-3 md:mb-5">{L.contacts}</h2>
            <div className="text-sm space-y-2 text-subtle">
              <p><a href={`tel:${s.phoneHref}`} className="hover:text-primary transition text-ink">{s.phone}</a></p>
              <p>{s.address}</p>
              <p>{s.hoursWeekday}</p>
              <p>{s.hoursWeekend}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
