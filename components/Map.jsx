"use client";
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { siteConfig } from "@/lib/site.config";

const Map = ({ lat, lng, zoom = 16, name, logo, mapsUrl, gisUrl }) => {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const L = siteConfig.t.map;
  const design = siteConfig.design;

  const latN = Number(lat);
  const lngN = Number(lng);
  const valid = Number.isFinite(latN) && Number.isFinite(lngN);

  useEffect(() => {
    if (!valid) {
      setFailed(true);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const L = (await import("leaflet")).default;
        if (cancelled || !ref.current || mapRef.current) return;

        const map = L.map(ref.current, {
          scrollWheelZoom: false,
          attributionControl: false,
          zoomControl: false,
        }).setView([latN, lngN], zoom);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap",
          subdomains: "abc",
          maxZoom: 19,
        }).addTo(map);

        const tilePane = map.getPane("tilePane");
        if (tilePane) {
          tilePane.style.filter = design.mapTile || "saturate(0.82) brightness(1.05) contrast(0.96) sepia(0.12)";
        }

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
              <div style="font-family:inherit;font-weight:900;font-size:20px;line-height:1;letter-spacing:-0.025em;white-space:nowrap;color:var(--c-primary);text-shadow:0 0 3px #fff,0 0 8px #fff,-1.5px 0 1.5px #fff,1.5px 0 1.5px #fff,0 -1.5px 1.5px #fff,0 1.5px 1.5px #fff,-1.5px -1.5px 1.5px #fff,1.5px 1.5px 1.5px #fff,-1.5px 1.5px 1.5px #fff,1.5px -1.5px 1.5px #fff">${name || ""}</div>
              <div style="
                width:52px;height:52px;border-radius:50% 50% 50% 4px;
                transform:rotate(-45deg);
                background:linear-gradient(135deg, var(--c-primary), var(--c-primary-dark));
                box-shadow:0 10px 24px rgba(0,0,0,.28);
                display:flex;align-items:center;justify-content:center;
                border:2.5px solid #fff;
                overflow:hidden;
              ">
                <img src="${logo || "/icon-192.png"}" alt="" style="transform:rotate(45deg);width:30px;height:30px;object-fit:contain;filter:brightness(0) invert(1)" />
              </div>
            </div>`,
          iconSize: [160, 84],
          iconAnchor: [80, 82],
        });

        const marker = L.marker([latN, lngN], { icon, keyboard: false }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapRef.current = map;

        map.whenReady(() => {
          map.invalidateSize();
          map.panTo([latN, lngN]);
        });
      } catch (e) {
        console.error("Map init failed", e);
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [latN, lngN, zoom, name, valid]);

  if (failed || !valid) {
    return (
      <div className="w-full h-full min-h-[280px] rounded-3xl overflow-hidden bg-cream flex flex-col items-center justify-center text-center p-6 gap-3">
        <p className="text-sm text-subtle">{L.unavailable}</p>
        {valid && (
          <a
            href={`https://yandex.ru/maps/?ll=${lngN},${latN}&z=${zoom}&text=${encodeURIComponent(name || "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary text-white font-extrabold text-sm leading-none hover:bg-primary-dark transition"
          >
            <span className="leading-none translate-y-[0.5px]">{L.openYandex}</span>
          </a>
        )}
        <div className="flex flex-wrap gap-3 justify-center">
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
              {L.route}
            </a>
          )}
          {gisUrl && (
            <a href={gisUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
              {L.gis}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="w-full h-full min-h-[280px] rounded-3xl overflow-hidden relative z-0 isolate [&_.leaflet-container]:h-full [&_a.leaflet-control-zoom-in]:!text-ink [&_a.leaflet-control-zoom-out]:!text-ink [&_a.leaflet-control-zoom-in]:!rounded-l-xl [&_a.leaflet-control-zoom-out]:!rounded-r-xl [&_.leaflet-bar]:!border-0 [&_.leaflet-bar]:!shadow-lg [&_.leaflet-bar]:!overflow-hidden"
    />
  );
};

export default Map;
