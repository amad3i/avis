import { getSettings } from "@/lib/data";
import { siteConfig, fmt } from "@/lib/site.config";

export default async function manifest() {
  const s = await getSettings();
  const { brand, pwa, technical, colors } = siteConfig;

  return {
    name: s.shopName,
    short_name: s.shopName,
    description: fmt(pwa.description, { slogan: s.slogan }),
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: colors.colorBg || "#FFFFFF",
    theme_color: colors.colorPrimary,
    lang: technical.lang,
    icons: [
      { src: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ...(brand.favicon ? [{ src: brand.favicon, sizes: "any", type: "image/svg+xml" }] : []),
    ],
    shortcuts: [
      { name: pwa.shortcuts.menu, url: "/#menu" },
      { name: pwa.shortcuts.cart, url: "/?cart=1" },
    ],
  };
}