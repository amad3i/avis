"use client";
import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from "react";
import Logo from "@/components/Logo";
import Icon from "@/components/icons";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/site.config";

const KL = siteConfig.t.kitchen;
const K = siteConfig.t.kitchen;
const COLUMNS = [
  { status: "new", title: K.columns.new, icon: "sparkle", color: "bg-blue-500", iconBg: "bg-blue-500/15 text-blue-400", btn: "bg-amber-400 hover:bg-amber-300 text-black", btnLabel: K.buttons.cooking },
  { status: "cooking", title: K.columns.cooking, icon: "fire", color: "bg-amber-500", iconBg: "bg-amber-500/15 text-amber-400", btn: "bg-primary hover:bg-primary-dark text-white", btnLabel: K.buttons.ready },
  { status: "ready", title: K.columns.ready, icon: "check", color: "bg-primary", iconBg: "bg-primary/15 text-primary-light", btn: "bg-white/10 hover:bg-white/20 text-white border border-white/15", btnLabel: K.buttons.done },
  { status: "canceled", title: K.columns.canceled, icon: "x", color: "bg-red-500", iconBg: "bg-red-500/15 text-red-400", btn: "bg-primary/20 hover:bg-primary/30 text-primary-light border border-primary/30", btnLabel: K.buttons.reorder },
];

const fmtTime = (iso) =>
  new Date(iso).toLocaleTimeString(siteConfig.technical.locale, { hour: "2-digit", minute: "2-digit" });

const beep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
};

function KitchenCard({ o, col, onCancelClick, onStatus, fading }) {
  const mins = Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000);
  const late = mins > 15 && o.status !== "ready" && o.status !== "canceled";
  const userCanceled = o.canceledBy === "user";
  const resumeTarget =
    userCanceled || !["new", "cooking", "ready"].includes(o.prevStatus) ? "new" : o.prevStatus;
  const resumeCol = COLUMNS.find((c) => c.status === resumeTarget);
  return (
    <div
      data-card={o.id}
      className={`bg-[#171A20] rounded-2xl p-5 border-2 ${
        late ? "border-red-500/60 animate-pulse" : "border-white/5"
      } ${fading.has(o.id) ? "anim-fade-out-right" : "anim-card-in"}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-black text-lg sm:text-xl">№{o.id}</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-[11px] sm:text-xs font-bold inline-flex items-center gap-1 px-2 py-1 rounded-lg whitespace-nowrap ${
              late ? "bg-red-500/15 text-red-400" : "text-white/40"
            }`}
          >
            <Icon name="clock" className="w-3.5 h-3.5" />
            {fmtTime(o.createdAt)} · {mins < 60 ? `${mins} мин` : `${Math.floor(mins / 60)} ч ${mins % 60} мин`}
          </span>
          {col.status !== "canceled" && (
            <button
              type="button"
              onClick={() => onCancelClick(o.id)}
              aria-label={K.cancelAria}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 flex items-center justify-center transition shrink-0"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      {late && (
        <p className="mt-3 inline-flex items-center gap-1.5 bg-red-500/15 text-red-400 text-[11px] font-black uppercase tracking-wider px-2 py-1 rounded-lg">
          <Icon name="fire" className="w-3.5 h-3.5" />
          Priority - больше 15 мин
        </p>
      )}
      {o.pickupAt && o.pickupAt !== siteConfig.technical.pickNow && (
        <p className="text-primary-light text-xs font-extrabold mt-2 inline-flex items-center gap-1">
          <Icon name="clock" className="w-3 h-3" />
          к {o.pickupAt}
        </p>
      )}
      <p className="text-xs text-white/50 font-semibold mt-3 break-words">
        {o.customerName} · <span className="text-white/70">{o.phone}</span>
      </p>
      <div className="mt-4 space-y-2">
        {o.items.map((i, idx) => (
          <p key={idx} className="text-sm break-words">
            <span className="font-black text-primary-light">{i.quantity}×</span> {i.name}
            <span className="text-white/40"> · {i.sizeLabel}</span>
          </p>
        ))}
      </div>
      {o.comment && (
        <p className="text-xs text-primary mt-3 italic break-words whitespace-pre-wrap">«{o.comment}»</p>
      )}
      <div className="mt-5 space-y-2">
        {col.status === "new" && (
          <button
            onClick={() => onStatus(o.id, "cooking")}
            className={`w-full ${col.btn} font-extrabold text-base min-h-[52px] rounded-xl transition active:scale-[.98]`}
          >
            {col.btnLabel}
          </button>
        )}
        {col.status === "cooking" && (
          <button
            onClick={() => onStatus(o.id, "ready")}
            className={`w-full ${col.btn} font-extrabold text-base min-h-[52px] rounded-xl transition active:scale-[.98]`}
          >
            {col.btnLabel}
          </button>
        )}
        {col.status === "ready" && (
          <button
            onClick={() => onStatus(o.id, "done")}
            className={`w-full ${col.btn} font-extrabold text-base min-h-[52px] rounded-xl transition active:scale-[.98]`}
          >
            {col.btnLabel}
          </button>
        )}
        {col.status === "canceled" && !userCanceled && (
          <button
            onClick={() => onStatus(o.id, resumeTarget)}
            className={`w-full ${col.btn} font-extrabold text-base min-h-[52px] rounded-xl transition active:scale-[.98]`}
          >
            {K.buttons.reorder} {resumeCol ? resumeCol.title.toLowerCase() : K.columns.new.toLowerCase()}
          </button>
        )}
        {col.status === "canceled" && userCanceled && (
          <p className="text-center text-white/40 text-xs font-bold py-2">{K.columns.canceled} клиентом</p>
        )}
      </div>
    </div>
  );
}

function KitchenColumn({ col, orders, activeColumn, onCancelClick, onStatus, fading }) {
  const containerRef = useRef(null);
  const prevRects = useRef(new Map());
  const firstRender = useRef(true);

  const list = [...orders].sort((a, b) =>
    col.status === "canceled"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt)
  );
  const sig = list.map((o) => `${o.id}:${o.status}`).join("|");

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    try {
      const cur = new Map();
      root.querySelectorAll("[data-card]").forEach((el) => {
        cur.set(el.dataset.card, { rect: el.getBoundingClientRect(), el });
      });
      if (!firstRender.current) {
        cur.forEach(({ rect, el }, id) => {
          const old = prevRects.current.get(id);
          if (!el || !old) return;
          if (old.top !== rect.top) {
            const dy = old.top - rect.top;
            el.style.transform = `translateY(${dy}px)`;
            el.style.transition = "none";
            requestAnimationFrame(() => {
              el.style.transition = "transform .35s cubic-bezier(.2,.7,.2,1)";
              el.style.transform = "";
            });
          }
        });
      }
      prevRects.current = new Map([...cur].map(([id, v]) => [id, v.rect]));
      firstRender.current = false;
    } catch (e) {
      console.error("Kitchen FLIP animation error", e);
    }
  }, [sig]);
  const hiddenOnMobile = col.status !== activeColumn;

  return (
    <div
      className={`bg-white/[.04] rounded-3xl p-4 flex flex-col min-h-0 overflow-hidden ${
        hiddenOnMobile ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-4 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${col.iconBg}`}>
            <Icon name={col.icon} className="w-4 h-4" />
          </span>
          <p className="font-extrabold text-[15px] sm:text-base truncate">{col.title}</p>
        </div>
        <span className={`${col.color} text-xs font-black min-w-[28px] h-7 px-2 rounded-full flex items-center justify-center shrink-0 leading-none`}>
          <span className="translate-y-[0.5px]">{list.length}</span>
        </span>
      </div>
      <div ref={containerRef} className="space-y-5 overflow-y-auto overflow-x-hidden flex-1 min-h-0 pb-2">
        {list.map((o) => (
          <KitchenCard key={o.id} o={o} col={col} onCancelClick={onCancelClick} onStatus={onStatus} fading={fading} />
        ))}
        {list.length === 0 && <p className="text-center text-white/25 text-sm py-10">Пусто</p>}
      </div>
    </div>
  );
}

const Kitchen = ({ kitchenPath = "kitchen", adminPath = "admin" }) => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [updated, setUpdated] = useState(null);
  const [sound, setSound] = useState(true);
  const knownIds = useRef(new Set());
  const firstLoad = useRef(true);

  const load = useCallback(async () => {
    const [res, a] = await Promise.all([
      fetch("/api/orders?board=1").then((r) => r.json()),
      fetch("/api/analytics").then((r) => r.json()).catch(() => null),
    ]);
    const fresh = res.orders || [];
    if (!firstLoad.current) {
      const newOrders = fresh.filter((o) => o.status === "new" && !knownIds.current.has(o.id));
      if (newOrders.length && sound) beep();
    }
    firstLoad.current = false;
    knownIds.current = new Set(fresh.map((o) => o.id));
    setOrders(fresh);
    if (a) setAnalytics(a);
    setUpdated(new Date());
  }, [sound]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    let es;
    try {
      es = new EventSource("/api/events");
      es.onmessage = () => load();
      es.onerror = () => {};
    } catch {}
    return () => {
      clearInterval(t);
      if (es) es.close();
    };
  }, [load]);

  const [fading, setFading] = useState(new Set());

  const setStatus = async (id, status, canceledBy) => {
    if (status === "done" || status === "canceled") {
      setFading((prev) => new Set([...prev, id]));
      await new Promise((r) => setTimeout(r, 600));
    }
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, canceledBy }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || K.statusError);
      setFading((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      await load();
      return;
    }
    // Успех: обновляем доску и снимаем fade в ОДНОМ рендере,
    // чтобы карточка сразу появилась в нужной колонке без моргания/возврата.
    const [boardRes, aRes] = await Promise.all([
      fetch("/api/orders?board=1").then((r) => r.json()),
      fetch("/api/analytics").then((r) => r.json()).catch(() => null),
    ]);
    const fresh = boardRes.orders || [];
    setOrders(fresh);
    if (aRes) setAnalytics(aRes);
    setUpdated(new Date());
    knownIds.current = new Set(fresh.map((o) => o.id));
    setFading((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const stats = analytics
    ? [
        { label: K.todayCount, value: analytics.today.count, icon: "receipt" },
        { label: K.inWork, value: orders.filter((o) => o.status !== "canceled").length, icon: "fire" },
      ]
    : [];

  const [activeColumn, setActiveColumn] = useState("new");
  const [cancelTarget, setCancelTarget] = useState(null);

  return (
    <div className="w-full h-[100dvh] flex flex-col overflow-hidden overflow-x-hidden overscroll-x-none bg-[#0E1013] text-white">
      <header className="shrink-0 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 sticky top-0 z-30 bg-[#0E1013]/95 backdrop-blur">
        <div className="flex items-center gap-3 min-w-0">
          <Logo light />
          <span className="hidden sm:inline font-black text-lg tracking-tight leading-none text-white whitespace-nowrap translate-y-[0.5px]">
            {siteConfig.brand.shopName}
          </span>
        </div>
        <div className="flex items-center justify-center min-w-0">
          <span className="bg-primary/20 text-primary-light text-[10px] sm:text-xs font-extrabold uppercase tracking-[0.15em] px-2.5 sm:px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 whitespace-nowrap">
            <Icon name="chef" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{siteConfig.t.admin.kitchen}</span>
            <span className="sm:hidden">{K.badgeShort}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-5 text-sm justify-end min-w-0">
          <label className="flex items-center gap-1.5 font-bold text-white/60 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sound}
              onChange={(e) => setSound(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="hidden sm:inline">{K.soundToggle}</span>
          </label>
          <span className="text-white/35 hidden md:inline text-xs">
            {K.updated}: {updated ? fmtTime(updated.toISOString()) : "-"}
          </span>
          <button
            onClick={() => router.push("/" + adminPath)}
            className="text-white/60 hover:text-white font-bold transition inline-flex items-center gap-1.5 text-xs sm:text-sm bg-white/5 hover:bg-white/10 px-2 sm:px-3 py-1.5 rounded-lg shrink-0"
          >
            <Icon name="settings" className="w-4 h-4" />
            <span className="hidden sm:inline">{K.adminShort}</span>
          </button>
          <button
            onClick={logout}
            className="text-white/60 hover:text-white font-bold transition inline-flex items-center gap-1.5 text-xs sm:text-sm bg-white/5 hover:bg-white/10 px-2 sm:px-3 py-1.5 rounded-lg shrink-0"
          >
            <Icon name="logout" className="w-4 h-4" />
            <span className="hidden sm:inline">{siteConfig.t.admin.logout}</span>
          </button>
        </div>
      </header>

      {stats.length > 0 && (
        <div className="shrink-0 grid grid-cols-2 gap-2.5 sm:gap-3 px-3 sm:px-6 pt-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white/[.04] border border-white/10 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-primary/20 text-primary-light flex items-center justify-center shrink-0">
                <Icon name={s.icon} className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-black text-base sm:text-lg leading-none truncate translate-y-[0.5px]">{s.value}</p>
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/40 mt-1 truncate">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Мобильный таб-селектор колонок (горизонтальный скролл) */}
      <div className="md:hidden shrink-0 flex gap-2 px-3.5 pt-4 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {COLUMNS.map((col) => {
          const count = orders.filter((o) => o.status === col.status).length;
          const active = activeColumn === col.status;
          return (
            <button
              key={col.status}
              onClick={() => setActiveColumn(col.status)}
              className={`shrink-0 whitespace-nowrap snap-start flex items-center justify-center gap-1.5 py-3 px-3.5 min-w-[max-content] rounded-xl text-xs font-extrabold transition ${
                active ? "bg-primary text-white" : "bg-white/[.04] text-white/60"
              }`}
            >
              <Icon
                name={col.icon}
                className={`w-3.5 h-3.5 ${
                  active ? "" : col.status === "new" ? "text-blue-400" : col.status === "cooking" ? "text-amber-400" : "text-primary-light"
                }`}
              />
              <span className="truncate">{col.title}</span>
              <span className={`${active ? "bg-white/25" : col.color} text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center leading-none`}>
                <span className="translate-y-[0.5px]">{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 min-h-0 grid grid-rows-1 md:grid-cols-4 gap-4 sm:gap-5 px-4 pb-4 pt-4 md:pt-4">
        {COLUMNS.map((col) => (
          <KitchenColumn
            key={col.status}
            col={col}
            orders={orders.filter((o) => o.status === col.status)}
            activeColumn={activeColumn}
            onCancelClick={setCancelTarget}
            onStatus={setStatus}
            fading={fading}
          />
        ))}
      </div>

      {cancelTarget && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCancelTarget(null)} />
          <div className="relative bg-[#171A20] rounded-3xl border border-white/10 w-full max-w-sm p-6 text-center">
            <p className="font-extrabold text-lg text-white">Отменить заказ №{cancelTarget}?</p>
            <p className="text-sm text-white/50 mt-2">Заказ переместится в раздел «Отменён».</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={async () => {
                  const id = cancelTarget;
                  setCancelTarget(null);
                  await setStatus(id, "canceled", "kitchen");
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-extrabold py-3 rounded-xl transition"
              >
                Отменить
              </button>
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-extrabold py-3 rounded-xl transition"
              >
                Не отменять
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kitchen;
