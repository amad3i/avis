import { Manrope } from "next/font/google";
import "./globals.css";
import { siteConfig, fmt } from "@/lib/site.config";
import { getSettings, getProducts, getGlobalOptions } from "@/lib/data";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import PWAProvider from "@/components/PWA";
import ConsumerShell from "@/components/ConsumerShell";
import PrefetchAll from "@/components/PrefetchAll";
import { Toaster } from "react-hot-toast";

export const revalidate = 300;

// Рендерим всё динамически: на Vercel нет SQLite-файла на этапе сборки,
// поэтому запрещаем статическую генерацию страниц с обращением к БД.
export const dynamic = "force-dynamic";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export async function generateMetadata() {
  const s = await getSettings();
  const brand = siteConfig.brand;
  const { seo } = siteConfig;
  return {
    title: s.seoTitle || fmt(seo.fallbackTitle, { shop: s.shopName, slogan: s.slogan }),
    description:
      s.seoDescription ||
      fmt(seo.fallbackDescription, {
        shop: s.shopName,
        slogan: s.slogan,
        address: s.address,
        phone: s.phone,
      }),
    manifest: "/manifest.webmanifest",
    icons: {
      // Фавикон = сам logo.svg (SVG вкладки, без растров/ICO).
      icon: brand.favicon || brand.logoImage || "/icon-192.png",
      apple: brand.appleIcon || "/apple-touch-icon.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: s.shopName,
    },
  };
}

export const viewport = {
  themeColor: siteConfig.colors.colorPrimary,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }) {
  const [s, products, options] = await Promise.all([
    getSettings(),
    getProducts(),
    getGlobalOptions(),
  ]);

  const cartProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    icon: p.icon,
    image: p.image,
    category: p.category ? { name: p.category.name, icon: p.category.icon } : null,
    sizes: p.sizes.map((sz) => ({ id: sz.id, label: sz.label, price: sz.price })),
  }));

  const themeVars = `:root{
    --c-primary:${s.colorPrimary};
    --c-primary-dark:${s.colorPrimaryDark};
    --c-primary-light:${s.colorPrimaryLight};
    --c-secondary:${s.secondaryColor || siteConfig.colors.secondaryColor};
    --c-ink:${s.colorInk};
    --c-bg:${s.colorBg};
  }`;

  return (
    <html lang={siteConfig.technical.lang}>
      <body className={`${manrope.variable} font-sans antialiased text-ink bg-cream`}>
        <style>{themeVars}</style>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: siteConfig.design.toast.radius,
              fontWeight: 600,
              background: siteConfig.design.toast.bg,
              color: siteConfig.design.toast.text,
            },
          }}
        />
        <PrefetchAll productIds={products.map((p) => p.id)} />
        <PWAProvider>
            <CartProvider products={cartProducts} options={options.map((o) => ({ id: o.id, name: o.name, price: o.price, group: o.group }))}>
            <ConsumerShell
              shop={s.shopName}
              phone={s.phone}
              phoneHref={s.phoneHref}
              address={s.address}
              hoursWeekday={s.hoursWeekday}
              hoursWeekend={s.hoursWeekend}
            >
              {children}
            </ConsumerShell>
            <CartDrawer readyMinutes={Number(s.readyMinutes || siteConfig.readyMinutes || 20)} />
          </CartProvider>
        </PWAProvider>
      </body>
    </html>
  );
}
