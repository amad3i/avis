// Генерирует public/sw.js и public/offline.html из единого white-label конфига,
// чтобы кэш-имя, прекэш, брендинг и тексты офлайн-страницы менялись в одном месте.
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { siteConfig } from "../lib/site.config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const { brand, colors, t, technical } = siteConfig;
const primary = colors.colorPrimary;
const lang = technical.lang;

const slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "brand";
const CACHE = `${slug}-v1`;

const precache = JSON.stringify([
  "/offline.html",
  brand.favicon || "/logo.svg",
  brand.icon || "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/manifest.webmanifest",
]);

const sw = `const CACHE = ${JSON.stringify(CACHE)};
const PRECACHE = ${precache};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/kitchen")) return;

  // навигации - network-first с офлайн-фолбэком
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline.html")))
    );
    return;
  }

  // статика Next - всегда с сети, чтобы в dev не отдавать залипший JS/CSS
  if (url.pathname.startsWith("/_next/static")) {
    event.respondWith(fetch(request));
    return;
  }

  // иконки/fonts/статика - stale-while-revalidate
  if (
    url.pathname.startsWith("/icon") ||
    url.pathname.startsWith("/file.svg") ||
    url.pathname.startsWith("/globe.svg") ||
    url.pathname.startsWith("/window.svg") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // остальное - network-first
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request))
  );
});
`;

const offline = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${t.offline.head} - ${brand.name}</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: ${colors.colorBg === "#FFFFFF" ? "#FAF5EF" : colors.colorBg}; font-family: system-ui, -apple-system, sans-serif; color: ${colors.colorInk}; text-align: center; }
    .card { background: #fff; border-radius: 24px; padding: 48px 40px; max-width: 380px; margin: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,.08); }
    .icon { width: 72px; height: 72px; border-radius: 20px; background: ${primary}; color: #fff; margin: 0 auto 24px;
      display: flex; align-items: center; justify-content: center; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    p { color: #697384; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
    a { display: inline-block; background: ${primary}; color: #fff; text-decoration: none; font-weight: 800;
      padding: 14px 32px; border-radius: 999px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      <img src="${brand.favicon || "/logo.svg"}" width="44" height="44" alt="${brand.name}" style="filter: invert(1);" />
    </div>
    <h1>${t.offline.title}</h1>
    <p>${t.offline.text}</p>
    <a href="/">${t.offline.retry}</a>
  </div>
</body>
</html>
`;

writeFileSync(join(publicDir, "sw.js"), sw);
writeFileSync(join(publicDir, "offline.html"), offline);
console.log(`[static] sw.js + offline.html written (cache: ${CACHE})`);