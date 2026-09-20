"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import OrderStatusTracker from "./OrderStatusTracker";
import CancelOrderButton from "./CancelOrderButton";
import ReorderButton from "./ReorderButton";

export default function OrderAutoResolve({
  orderId,
  token,
  initialStatus,
  canceledBy,
  canCancelInitial,
  phone,
  phoneHref,
  reorderItems,
}) {
  const router = useRouter();
  const { removeOrder, clearFinishedOrders } = useCart();
  const [status, setStatus] = useState(initialStatus);
  const statusRef = useRef(initialStatus);
  statusRef.current = status;
  const canceledByRef = useRef(canceledBy);
  const doneFiredRef = useRef(false);

  // Опрашиваем статус заказа и держим живой статус в состоянии,
  // чтобы вся обвязка (кнопка отмены / блок отмены) реагировала на смену статуса.
  useEffect(() => {
    let cancelled = false;
    let handle;
    const poll = async () => {
      if (cancelled) return;
      const s = statusRef.current;
      if (s === "done" || s === "canceled") return;
      try {
        const res = await fetch(
          `/api/orders/${orderId}/status?token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.status) {
            setStatus(data.status);
            if (data.canceledBy) canceledByRef.current = data.canceledBy;
            if (data.status === "done" && !doneFiredRef.current) {
              doneFiredRef.current = true;
              removeOrder(orderId);
              clearFinishedOrders();
              router.replace("/");
            }
          }
        }
      } catch {}
      if (!cancelled) {
        const cur = statusRef.current;
        if (!(cur === "done" || cur === "canceled")) handle = setTimeout(poll, 8000);
      }
    };
    handle = setTimeout(poll, 5000);
    return () => {
      cancelled = true;
      if (handle) clearTimeout(handle);
    };
  }, [orderId, token, removeOrder, clearFinishedOrders, router]);

  // Очищаем завершённые заказы при выходе со страницы.
  const clearRef = useRef(clearFinishedOrders);
  clearRef.current = clearFinishedOrders;
  useEffect(() => () => clearRef.current(), []);

  const byKitchen = canceledByRef.current === "kitchen";
  const canCancelNow = status !== "canceled" && status !== "done" && canCancelInitial;

  return (
    <>
      <OrderStatusTracker status={status} canceledBy={canceledByRef.current} />

      {status === "canceled" ? (
        <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
          <p className="text-sm font-bold text-rose-700">Заказ отменён</p>
          <p className="text-sm text-subtle mt-1">
            {byKitchen
              ? "К сожалению, заведение отменило этот заказ."
              : "Вы отменили этот заказ."}{" "}
            Оформите заново или свяжитесь с нами.
          </p>
          {phone ? (
            <a
              href={`tel:${phoneHref || phone}`}
              className="block mt-1 text-base font-bold text-ink hover:text-primary transition"
            >
              {phone}
            </a>
          ) : null}
          {reorderItems && reorderItems.length > 0 ? (
            <ReorderButton
              items={reorderItems}
              className="inline-flex items-center justify-center mt-3 px-5 py-2 bg-primary text-white rounded-full font-bold text-sm hover:brightness-110 transition"
            />
          ) : (
            <a
              href="/"
              className="inline-flex items-center justify-center mt-3 px-5 py-2 bg-primary text-white rounded-full font-bold text-sm hover:brightness-110 transition"
            >
              Оформить заново
            </a>
          )}
        </div>
      ) : (
        <p className="text-sm text-subtle mt-4">
          Подойдите к точке продажи, назовите номер заказа и оплатите при получении.
        </p>
      )}

      {canCancelNow ? (
        <CancelOrderButton orderId={orderId} token={token} />
      ) : (
        status !== "canceled" && status !== "done" && (
          <p className="mt-6 text-center text-sm text-subtle">
            Отмена доступна, пока заказ не готов к выдаче (и в течение 15 секунд после начала готовки).
          </p>
        )
      )}
    </>
  );
}
