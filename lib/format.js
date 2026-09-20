import { siteConfig, fmt } from "@/lib/site.config";

export const formatPrice = (n) => `${Math.round(n)} ${siteConfig.technical.currency}`;

export function formatDate(iso) {
  return new Date(iso).toLocaleString(siteConfig.technical.locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const parseGallery = (galleryJson) => {
  try {
    const arr = JSON.parse(galleryJson || "[]");
    return Array.isArray(arr) ? arr.filter(Boolean) : [];
  } catch {
    return [];
  }
};

// Для стоматологии размер услуги подписывается как есть (без склонений).
export const sausageWord = (n) => {
  const v = Number(n);
  const mod10 = v % 10;
  const mod100 = v % 100;
  if (mod10 === 1 && mod100 !== 11) return "услуга";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "услуги";
  return "услуг";
};

export function sausageSizeLabel(label, categoryName) {
  return label;
}

export { fmt };