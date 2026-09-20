"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import Icon from "./icons";
import { useCart } from "@/context/CartContext";
import { sausageSizeLabel } from "@/lib/format";
import { STATUS_META } from "@/lib/orderStatus";
import { siteConfig, fmt as tpl } from "@/lib/site.config";

const L = siteConfig.t;
const CART_L = siteConfig.t.cart;
const PICK_NOW = siteConfig.technical.pickNow;

const fmt = (n) => `${n} ${siteConfig.technical.currency}`;

const genIdemKey = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function timeSlots(readyMinutes = 20) {
  const slots = [PICK_NOW];
  const now = new Date();
  const start = new Date(now.getTime() + readyMinutes * 60000);
  start.setMinutes(start.getMinutes() > 30 ? 60 : 30, 0, 0);
  for (let i = 0; i < 12; i++) {
    const t = new Date(start.getTime() + i * 30 * 60000);
    slots.push(
      `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`
    );
  }
  return slots;
}

const CartDrawer = ({ readyMinutes = 20 }) => {
  const { open, setOpen, items, setQty, clear, total, view, setView, placeOrderSuccess, lastOrder, lastToken, orders, statuses, clearFinishedOrders } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [pickupAt, setPickupAt] = useState(PICK_NOW);
  const [submitting, setSubmitting] = useState(false);
  const [lastPickup, setLastPickup] = useState("");
  const idemKeyRef = useRef(null);
  useEffect(() => {
    if (view === "form") idemKeyRef.current = genIdemKey();
  }, [view]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const submit = async (e) => {
    e.preventDefault();
    const phoneDigits = phone.replace(/\D/g, "");
    if (!name.trim() || !/^[78]/.test(phoneDigits) || phoneDigits.length !== 11) {
      toast.error(CART_L.phoneError);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idemKeyRef.current,
          customerName: name,
          phone,
          comment,
          pickupAt,
          items: items.map((i) => ({
            productId: i.productId,
            sizeId: i.sizeId,
            optionIds: i.options.map((o) => o.id),
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setLastPickup(pickupAt);
      placeOrderSuccess(data.number, data.token);
      idemKeyRef.current = null;
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        onClick={() => { setOpen(false); clearFinishedOrders(); }}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-cream neu-col z-[70] flex flex-col transition-transform duration-300 ease-[cubic-bezier(.32,.72,.35,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-cream">
          <p className="font-extrabold text-lg text-ink">
            {view === "cart" && CART_L.title}
            {view === "form" && CART_L.formTitle}
            {view === "success" && CART_L.successTitle}
          </p>
          <button
            onClick={() => { setOpen(false); clearFinishedOrders(); }}
            className="w-9 h-9 rounded-full bg-cream neu-xs flex items-center justify-center hover:text-primary transition text-ink"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        {view === "cart" && (
          <>
            {orders.length > 0 && (
              <div className="px-6 pt-4">
                <div className="rounded-3xl bg-cream neu-inset-sm p-3">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-subtle">{CART_L.yourOrders}</p>
                    <span className="text-[10px] text-subtle/70 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      {CART_L.live}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {orders.map((o) => {
                      const st = statuses[o.id];
                      const status = st?.status;
                      const meta = status ? STATUS_META[status] : STATUS_META.new;
                      const label = status
                        ? status === "canceled"
                          ? st.canceledBy === "kitchen"
                            ? CART_L.canceledByVenue
                            : st.canceledBy === "user"
                            ? CART_L.canceledByUser
                            : CART_L.canceled
                          : meta.label
                        : CART_L.accepted;
                      return (
                        <Link
                          key={o.id}
                          href={`/order/${o.id}?token=${o.token}`}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 p-3 rounded-xl transition ${meta.plaque}`}
                        >
                          <Icon name={meta.icon} className="w-[18px] h-[18px] shrink-0 text-white" strokeWidth={2} style={{ width: 18, height: 18 }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm leading-tight">{tpl(CART_L.orderNumber, { n: o.id })}</p>
                            <p className={`text-xs font-semibold ${meta.text}`}>{label}</p>
                            {status === "canceled" && (
                              <p className="text-[11px] text-white/80 font-medium mt-0.5">{CART_L.details}</p>
                            )}
                          </div>
                          <Icon name="arrowRight" className="w-4 h-4 text-white/70 shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
               {items.length === 0 && (
                 <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <div className="w-20 h-20 rounded-[28px] bg-cream neu text-primary flex items-center justify-center">
                     <Icon name="calendar" className="w-9 h-9" />
                   </div>
                    <p className="font-bold text-ink">{CART_L.empty}</p>
                    <p className="text-sm text-subtle -mt-2">{CART_L.emptyHint}</p>
                 </div>
               )}
              {items.map((i) => (
                <div key={i.key} className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-cream neu-inset-sm overflow-hidden flex items-center justify-center shrink-0">
                    {i.product.image ? (
                      <Image src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" width={128} height={128} />
                    ) : (
                      <Icon name={i.product.icon} className="w-7 h-7 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-ink leading-tight truncate">{i.product.name}</p>
                     <p className="text-xs text-subtle">
                       {sausageSizeLabel(i.size.label, i.product.category?.name)} · {fmt(i.size.price)}
                      {i.options.length > 0 && (
                        <span className="text-primary-dark font-semibold">
                          {" "}+ {i.options.map((o) => o.name).join(", ")}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        onClick={() => setQty(i.productId, i.sizeId, i.optionIds, i.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-cream text-ink neu-xs flex items-center justify-center hover:text-primary transition"
                      >
                        <Icon name="minus" className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{i.quantity}</span>
                      <button
                        onClick={() => setQty(i.productId, i.sizeId, i.optionIds, i.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-primary text-white neu-inset-sm flex items-center justify-center hover:brightness-110 transition"
                      >
                        <Icon name="plus" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="font-extrabold text-ink text-sm whitespace-nowrap">{fmt(i.sum)}</p>
                </div>
              ))}
            </div>
            {items.length > 0 && (
              <div className="px-6 py-5 bg-cream">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-subtle text-sm font-semibold uppercase tracking-wide text-xs">{CART_L.totalLabel}</span>
                  <span className="font-black text-2xl text-ink">{fmt(total)}</span>
                </div>
                <button
                  onClick={() => setView("form")}
                  className="w-full bg-primary text-white py-4 rounded-full font-extrabold leading-none transition-all duration-300 hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <span className="leading-none translate-y-[0.5px]">{CART_L.checkout}</span>
                  <Icon name="arrowRight" className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-subtle text-center mt-3 flex items-center justify-center gap-1.5">
                  <Icon name="route" className="w-3.5 h-3.5" />
                  {CART_L.pickupLine}
                </p>
              </div>
            )}
          </>
        )}

        {view === "form" && (
          <form onSubmit={submit} className="flex-1 flex flex-col min-h-0">
           <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-subtle">{CART_L.nameLabel}</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={CART_L.namePlaceholder}
                className="mt-1.5 w-full neu-field rounded-2xl px-4 py-3 outline-none text-ink"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-subtle">{CART_L.phoneLabel}</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={CART_L.phonePlaceholder}
                inputMode="tel"
                className="mt-1.5 w-full neu-field rounded-2xl px-4 py-3 outline-none text-ink"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-subtle">{CART_L.pickupTimeLabel}</label>
              <select
                value={pickupAt}
                onChange={(e) => setPickupAt(e.target.value)}
                className="mt-1.5 w-full neu-field rounded-2xl px-4 py-3 outline-none text-ink bg-cream"
              >
                {timeSlots(readyMinutes).map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-subtle">{CART_L.commentLabel}</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={CART_L.commentPlaceholder}
                rows={2}
                className="mt-1.5 w-full neu-field rounded-2xl px-4 py-3 outline-none text-ink resize-none"
              />
            </div>
            {items.length > 0 && (
              <div className="bg-cream rounded-[22px] neu-xs p-4 text-sm divide-y divide-black/5">
                {items.map((i) => (
                  <div key={i.key} className="py-2 first:pt-0 last:pb-0 flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink leading-tight">{i.product.name}</p>
                      <p className="text-xs text-subtle">
                        {sausageSizeLabel(i.size.label, i.product.category?.name)}
                        {i.options.length > 0 && (
                          <span className="text-primary-dark font-semibold">
                            {" "}
                            + {i.options.map((o) => o.name).join(", ")}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-subtle mt-0.5">
                        {i.quantity} × {fmt(i.unitPrice)}
                      </p>
                    </div>
                    <p className="font-extrabold text-ink whitespace-nowrap">{fmt(i.sum)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-cream rounded-[22px] neu-xs p-4 text-sm space-y-1.5">
              <div className="flex justify-between">
                <span className="text-subtle">{CART_L.positions}</span>
                <span className="font-bold">{items.reduce((a, i) => a + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-subtle">{CART_L.payment}</span>
                <span className="font-bold">{CART_L.onReceive}</span>
              </div>
              <div className="flex justify-between text-base pt-1">
                <span className="font-bold">{CART_L.totalLabel}</span>
                <span className="font-black">{fmt(total)}</span>
              </div>
            </div>
           </div>
            <div className="px-6 py-4 bg-cream">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-4 rounded-full font-extrabold transition-all duration-300 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icon name="check" className="w-5 h-5" />
                {submitting ? CART_L.sending : CART_L.submit}
              </button>
              <button
                type="button"
                onClick={() => setView("cart")}
                className="w-full py-2.5 text-sm font-semibold text-subtle hover:text-ink transition"
              >
                {CART_L.backToCart}
              </button>
            </div>
          </form>
        )}

        {view === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center">
            <Icon name="check" className="w-9 h-9" strokeWidth={2.5} />
          </div>
            <p className="text-2xl font-black text-ink">{tpl(CART_L.success, { n: lastOrder })}</p>
            <p className="text-sm text-subtle leading-6">
              {CART_L.successText}
              <span className="block mt-2 font-bold text-primary-dark">
                {tpl(CART_L.eta, { min: readyMinutes, max: readyMinutes + 10 })}
                {lastPickup !== PICK_NOW ? ` ${tpl(CART_L.toTime, { t: lastPickup })}` : ""}
              </span>
            </p>
            <Link
              href={`/order/${lastOrder}?token=${lastToken}`}
              onClick={() => setOpen(false)}
              className="mt-2 px-8 py-3 bg-primary text-white rounded-full font-bold transition hover:brightness-110 text-center"
            >
              {CART_L.track}
            </Link>
            <button
              onClick={() => { setOpen(false); clearFinishedOrders(); }}
              className="mt-2 px-8 py-3 bg-cream neu-sm hover:text-primary rounded-full font-bold text-ink transition"
            >
              {CART_L.done}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default CartDrawer;
