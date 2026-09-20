import React from "react";
import {
  Clock, Phone, MapPin, ShoppingCart, ShoppingBag, Plus, Minus, X, Check,
  ArrowRight, ArrowLeft, ChevronDown, BarChart3, Receipt, Package, ImageIcon,
  Settings, LogOut, Home, ChefHat, Download, Trash2, Pencil, Eye, Route, Star,
  Sparkles, Users, CreditCard, Search, Utensils, Flame, Smile, Stethoscope,
  Scan, CalendarDays, ShieldCheck, Zap, Wallet,
} from "lucide-react";

/* Кастомные стоматологические иконки (нет в lucide) */
const ToothIcon = ({ className, strokeWidth = 1.8 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 3.6c-1.6 0-2.4.8-3.4.8-1 0-1.7-1-2.9-1-1.2 0-2 .8-2.3 2l-1 5.2c-.4 2 .8 3.6 2.6 3.6 1.6 0 2-1 2.4-1.5.4-.6 1-.8 1.3-.3.5.9.5 3.4 1.2 4.4.6.9 1.4 1 2.1 1s1.5-.2 2.1-1c.7-1 .7-3.5 1.2-4.4.3-.5.9-.3 1.3.3.4.5.8 1.5 2.4 1.5 1.8 0 3-1.6 2.6-3.6l-1-5.2c-.3-1.2-1.1-2-2.3-2-1.2 0-1.9 1-2.9 1-1 0-1.8-.8-3.4-.8z" />
  </svg>
);

const ToothbrushIcon = ({ className, strokeWidth = 1.8 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 4l8 8-4 4-8-8z" />
    <path d="M8 12l-3 3.5a2.5 2.5 0 1 0 3.5 3.5L12 16M4 20l5-5" />
  </svg>
);

const ImplantIcon = ({ className, strokeWidth = 1.8 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 3v3" />
    <path d="M12 13v1.5" />
    <path d="M8.5 5.5h7" />
    <path d="M8 13h8" />
    <circle cx="12" cy="19" r="2.4" />
    <path d="M10 22.5c2.5-3 4.5-1 5.5-1.5" />
  </svg>
);

const GridIcon = ({ className, strokeWidth = 1.8 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.6" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.6" />
  </svg>
);

const InstagramIcon = ({ className, strokeWidth = 1.8 }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="4.5" />
    <circle cx="12" cy="12" r="3.5" />
    <circle cx="16.8" cy="7.2" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const YandexIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" fill="currentColor" />
    <text x="12" y="16.5" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ffffff" fontFamily="system-ui, -apple-system, sans-serif">Я</text>
  </svg>
);

const TwoGisIcon = ({ className }) => (
  <svg viewBox="0 0 50 22" className={className} aria-hidden="true">
    <text x="25" y="17" textAnchor="middle" fontSize="19" fontWeight="800" fill="currentColor" fontFamily="system-ui, -apple-system, sans-serif">2ГИС</text>
  </svg>
);

const map = {
  clock: Clock,
  phone: Phone,
  pin: MapPin,
  cart: ShoppingCart,
  bag: ShoppingBag,
  plus: Plus,
  minus: Minus,
  x: X,
  check: Check,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  chevronDown: ChevronDown,
  instagram: InstagramIcon,
  yandex: YandexIcon,
  "2gis": TwoGisIcon,
  chart: BarChart3,
  receipt: Receipt,
  box: Package,
  image: ImageIcon,
  settings: Settings,
  logout: LogOut,
  home: Home,
  chef: ChefHat,
  utensils: Utensils,
  fire: Flame,
  download: Download,
  trash: Trash2,
  edit: Pencil,
  eye: Eye,
  route: Route,
  star: Star,
  sparkle: Sparkles,
  sparkles: Sparkles,
  users: Users,
  card: CreditCard,
  search: Search,
  wallet: Wallet,
  bolt: Zap,
  shield: ShieldCheck,
  smile: Smile,
  stethoscope: Stethoscope,
  scan: Scan,
  calendar: CalendarDays,

  // Стоматологические иконки (кастомные)
  grid: GridIcon,
  tooth: ToothIcon,
  toothbrush: ToothbrushIcon,
  implant: ImplantIcon,
};

const Icon = ({ name, className = "w-5 h-5", strokeWidth = 1.8 }) => {
  const Cmp = map[name] || ToothIcon;
  return <Cmp className={`${className}`} strokeWidth={strokeWidth} aria-hidden="true" />;
};

export const ICON_NAMES = Object.keys(map);
export default Icon;