import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductAddToCart from "@/components/ProductAddToCart";
import MenuGrid from "@/components/MenuGrid";
import Icon from "@/components/icons";
import Gallery from "@/components/Gallery";
import { parseGallery } from "@/lib/format";
import { getSettings, getProducts, getGlobalOptions } from "@/lib/data";

export const revalidate = 300;

// Нет статической генерации: на Vercel при сборке нет SQLite-БД.
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }) {
  const { id } = await params;
  const productId = Number(id);
  const [s, products, options] = await Promise.all([
    getSettings(),
    getProducts(),
    getGlobalOptions(),
  ]);

  const product = products.find((p) => p.id === productId);
  if (!product) notFound();

  const gallery = parseGallery(product.gallery);

  const related = products
    .filter((p) => p.id !== product.id)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      icon: p.icon,
      image: p.image,
      hit: p.hit,
      categoryId: p.categoryId,
      sizes: p.sizes.map((sz) => ({ id: sz.id, label: sz.label, price: sz.price })),
    }));

  const serializable = {
    id: product.id,
    name: product.name,
    category: product.category ? { name: product.category.name, icon: product.category.icon } : null,
    sizes: product.sizes.map((sz) => ({ id: sz.id, label: sz.label, price: sz.price })),
  };

  return (
    <>
      <div className="px-4 md:px-10 lg:px-16 xl:px-28 pt-8">
        <Link href="/#menu" className="inline-flex items-center gap-1.5 text-sm font-bold text-subtle hover:text-primary transition">
          <Icon name="arrowRight" className="w-4 h-4 rotate-180" />
          Назад к услугам
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 xl:gap-16 mt-6">
          {product.image || gallery.length ? (
            <Gallery images={[product.image, ...gallery].filter(Boolean)} alt={product.name} />
          ) : (
            <div className="rounded-4xl bg-cream neu-inset-sm aspect-square flex items-center justify-center">
              <div className="w-28 h-28 rounded-[30px] bg-cream neu-xs text-primary flex items-center justify-center">
                <Icon name={product.icon} className="w-14 h-14" />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2 flex-wrap">
            {product.hit && (
              <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">
                Хит
              </span>
            )}
            {product.isNew && (
              <span className="bg-primary text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest">
                New
              </span>
            )}
            <span className="text-xs font-bold text-subtle uppercase tracking-wide inline-flex items-center gap-1.5">
              <Icon name={product.category.icon} className="w-4 h-4" />
              {product.category.name}
            </span>
          </div>
          <h1 className="h1 text-ink">{product.name}</h1>
          <p className="text-subtle leading-7">
            <span className="font-bold text-ink">Описание: </span>
            {product.description}
          </p>

            <ProductAddToCart
              product={serializable}
              options={options.map((o) => ({ id: o.id, name: o.name, price: o.price, group: o.group }))}
            />
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20 pb-14">
            <h2 className="h2 text-ink mb-3">Похожие услуги</h2>
            <MenuGrid
              categories={[]}
              products={related}
              showAllChip={false}
              imageAspect="aspect-square"
              gridTopMargin="mt-3"
            />
          </div>
        )}
      </div>
    </>
  );
}
