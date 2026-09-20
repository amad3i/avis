import { siteConfig } from "@/lib/site.config";

const L = siteConfig.t.orderStatus;

export const STATUS_META = {
  new: { label: L.new, icon: "clock", dot: "bg-white/20 text-white", text: "text-white", plaque: "bg-primary" },
  cooking: { label: L.cooking, icon: "utensils", dot: "bg-white/20 text-white", text: "text-white", plaque: "bg-primary" },
  ready: { label: L.ready, icon: "bag", dot: "bg-white/25 text-white", text: "text-white", plaque: "bg-primary" },
  done: { label: L.done, icon: "check", dot: "bg-white/20 text-white", text: "text-white", plaque: "bg-primary" },
  canceled: { label: L.canceled, icon: "x", dot: "bg-white/20 text-white", text: "text-white", plaque: "bg-red-500" },
};

const ACTIVE_RANK = { ready: 3, cooking: 2, new: 1 };

export function statusMeta(status) {
  return STATUS_META[status] || STATUS_META.new;
}

// Самый «горячий» активный статус среди заказов — для индикатора на иконке корзины.
export function getActiveStatus(orders, statuses) {
  if (!orders || orders.length === 0) return null;
  let best = null;
  let bestRank = 0;
  for (const o of orders) {
    const s = statuses?.[o.id]?.status;
    if (s && ACTIVE_RANK[s] && ACTIVE_RANK[s] > bestRank) {
      best = s;
      bestRank = ACTIVE_RANK[s];
    }
  }
  return best;
}
