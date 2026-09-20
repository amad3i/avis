import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import MenuGrid from "@/components/MenuGrid";
import HowWeWork from "@/components/HowWeWork";
import AppPromo from "@/components/AppPromo";
import Reviews from "@/components/Reviews";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";
import ScrollManager from "@/components/ScrollManager";
import { siteConfig } from "@/lib/site.config";
import { getSettings, getSlides, getCategories, getProducts } from "@/lib/data";

export const revalidate = 60;

const Home = async () => {
  const [s, slides, categories, products] = await Promise.all([
    getSettings(),
    getSlides(),
    getCategories(),
    getProducts(),
  ]);

  const SAUCE_CATEGORY = siteConfig.sauceCategory;
  const MENU_L = siteConfig.t.menuSection;

  const menuCategories = categories.filter((c) => c.name !== SAUCE_CATEGORY);

  const categorySort = new Map(categories.map((c) => [c.id, c.sortOrder]));

  const menuProducts = products
    .filter((p) => p.category?.name !== SAUCE_CATEGORY)
    .sort((a, b) => {
      const byCat = (categorySort.get(a.categoryId) ?? 0) - (categorySort.get(b.categoryId) ?? 0);
      if (byCat !== 0) return byCat;
      if (a.hit !== b.hit) return a.hit ? -1 : 1;
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
      image: p.image,
      zoom: p.zoom,
      fit: p.fit,
      rotate: p.rotate,
      whiteBg: p.whiteBg,
      hit: p.hit,
      isNew: p.isNew,
      categoryId: p.categoryId,
      sizes: p.sizes.map((sz) => ({ id: sz.id, label: sz.label, price: sz.price })),
    }));

  return (
    <>
      <ScrollManager />
      <HeroSlider slides={slides} scrim={s.heroScrim === "true" || s.heroScrim === true} />
      <div className="px-4 md:px-10 lg:px-16 xl:px-28">
        <div className="mt-14 md:mt-20 scroll-mt-20" id="menu">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-primary">{MENU_L.eyebrow}</p>
              <h2 className="h2 text-ink mt-1.5">{MENU_L.title}</h2>
            </div>
              <Link href="/#menu" className="text-sm font-bold text-ink hover:text-primary transition inline-flex items-center gap-1.5">
              {MENU_L.viewAll}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <MenuGrid categories={menuCategories} products={menuProducts} />
        </div>
        <HowWeWork />
        <AppPromo />
        <Reviews />
        <Contacts />
      </div>
      <Footer />
    </>
  );
};

export default Home;
