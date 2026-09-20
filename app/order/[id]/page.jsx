import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data";
import Icon from "@/components/icons";
import OrderAutoResolve from "@/components/OrderAutoResolve";
import { CANCEL_GRACE_MS } from "@/lib/orders";
import { siteConfig, fmt } from "@/lib/site.config";

const formatPrice = (n) => `${Math.round(n)} ${siteConfig.technical.currency}`;

export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const token = sp?.token;
  const L = siteConfig.t.orderPage;

  const order = await db.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order) notFound();

  const s = await getSettings();

  if (!token || order.cancelToken !== token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="text-2xl font-black text-ink">{L.noAccess}</p>
        <p className="text-subtle">{L.noAccessText}</p>
        <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-full font-bold">
          {L.home}
        </Link>
      </div>
    );
  }

  // Восстанавливаем позиции для повтора заказа. sizeLabel и options в OrderItem
  // хранятся как текст (raw size.label и [{name, price}]), поэтому сопоставляем
  // их с каталогом, чтобы получить реальные sizeId/optionIds для корзины.
  // Считаем всегда (не только при уже отменённом), т.к. блок повтора рендерит
  // клиент OrderAutoResolve по живому статусу — повар может отменить в любой момент.
  const reorderItems = [];
  {
    const productIds = [...new Set(order.items.map((i) => i.productId))];
    const [productsRaw, optionsRaw] = await Promise.all([
      db.product.findMany({ where: { id: { in: productIds } }, include: { sizes: true } }),
      db.option.findMany(),
    ]);
    const productById = {};
    for (const p of productsRaw) productById[p.id] = p;
    const optionKeyToId = {};
    for (const o of optionsRaw) optionKeyToId[`${o.name}::${o.price}`] = o.id;

    for (const it of order.items) {
      const p = productById[it.productId];
      if (!p || !p.sizes?.length) continue;
      const size = p.sizes.find((s) => s.label === it.sizeLabel) || p.sizes[0];
      if (!size) continue;
      const optionIds = [];
      try {
        const parsed = JSON.parse(it.options || "[]");
        if (Array.isArray(parsed)) {
          for (const opt of parsed) {
            const id = optionKeyToId[`${opt.name}::${opt.price}`];
            if (id != null) optionIds.push(id);
          }
        }
      } catch {}
      reorderItems.push({ productId: it.productId, sizeId: size.id, optionIds, quantity: it.quantity });
    }
  }

  let canCancel = order.status === "new";
  if (order.status === "cooking" || order.status === "ready") {
    const elapsed = Date.now() - new Date(order.updatedAt).getTime();
    canCancel = elapsed <= CANCEL_GRACE_MS;
  }

  return (
    <div className="px-4 md:px-10 lg:px-16 xl:px-28 py-10 max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1.5 mb-5 text-sm font-bold text-subtle hover:text-primary transition">
        <Icon name="arrowRight" className="w-4 h-4 rotate-180" />
        {L.back}
      </Link>
      <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
        {fmt(L.number, { n: order.id })}
      </p>
      <h1 className="h1 text-ink mt-2">{L.title}</h1>

      <OrderAutoResolve
        orderId={order.id}
        token={token}
        initialStatus={order.status}
        canceledBy={order.canceledBy}
        canCancelInitial={canCancel}
        phone={s.phone}
        phoneHref={s.phoneHref}
        reorderItems={reorderItems}
      />

      <div className="mt-6 bg-cream rounded-3xl neu-sm p-6 space-y-3">
        {order.items.map((it, i) => (
          <div
            key={i}
            className="flex justify-between gap-4 pb-3 border-b border-black/5 last:border-0 last:pb-0"
          >
            <div>
              <p className="font-bold text-ink">{it.name}</p>
              <p className="text-sm text-subtle">
                {it.sizeLabel} · {it.quantity} {L.units}
              </p>
            </div>
            <p className="font-bold text-ink whitespace-nowrap">
              {formatPrice(it.price * it.quantity)}
            </p>
          </div>
        ))}
        <div className="flex justify-between pt-2 text-lg">
          <span className="font-bold">{L.total}</span>
          <span className="font-black">{formatPrice(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
