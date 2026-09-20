"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PageTitle, StatusBadge, Btn, Select } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const STATUSES = ["new", "cooking", "ready", "done", "canceled"];
const LABELS = siteConfig.t.orderStatus;
const CUR = siteConfig.technical.currency;
const A = siteConfig.t.admin;

const fmtDate = (iso) =>
  new Date(iso).toLocaleString(siteConfig.technical.locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const Orders = () => {
  const { data, setOrders } = useAdminData();
  const orders = data.orders;
  const [filter, setFilter] = useState("active");

  const setStatus = async (id, status) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success(`Заказ №${id} → ${LABELS[status]}`);
      const json = await res.json();
      if (json.order) {
        setOrders((prev) => prev.map((o) => (o.id === id ? json.order : o)));
      }
    } else {
      toast.error("Ошибка");
    }
  };

  return (
    <>
      <PageTitle
        title={A.orders}
        subtitle={A.ordersSubtitle}
        action={
          <div className="flex items-center gap-3">
            <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-44">
              <option value="active">Активные</option>
              <option value="all">Все</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{LABELS[s]}</option>
              ))}
            </Select>
          </div>
        }
      />

      <div className="space-y-3 pb-20 md:pb-0">
        {orders.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-black/10 p-5">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-black text-ink text-lg">№{o.id}</span>
              <StatusBadge status={o.status} />
              <span className="text-xs text-subtle">{fmtDate(o.createdAt)}</span>
              {o.pickupAt && o.pickupAt !== siteConfig.technical.pickNow && (
                <span className="text-xs font-bold text-primary-dark bg-primary-light/20 px-2 py-0.5 rounded-full">
                  к {o.pickupAt}
                </span>
              )}
              <span className="font-black text-ink ml-auto text-lg">{o.total} {CUR}</span>
            </div>

            <div className="grid md:grid-cols-[1fr_auto] gap-4 mt-3">
              <div className="text-sm">
                <p className="text-ink font-bold">
                  {o.customerName} · <a href={`tel:${o.phone}`} className="text-primary hover:underline">{o.phone}</a>
                </p>
                <p className="text-subtle mt-1">
                  {o.items.map((i) => `${i.name} (${i.sizeLabel}) ×${i.quantity}`).join(" · ")}
                </p>
                {o.comment && <p className="text-xs text-subtle mt-1.5 italic">«{o.comment}»</p>}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {o.status === "new" && <Btn onClick={() => setStatus(o.id, "cooking")}>Начать готовить</Btn>}
                {o.status === "cooking" && <Btn onClick={() => setStatus(o.id, "ready")}>Готово</Btn>}
                {o.status === "ready" && <Btn onClick={() => setStatus(o.id, "done")}>Выдан</Btn>}
                {["new", "cooking"].includes(o.status) && (
                  <Btn variant="danger" onClick={() => setStatus(o.id, "canceled")}>Отменить</Btn>
                )}
                {["done", "canceled", "ready"].includes(o.status) && (
                  <Btn variant="outline" onClick={() => setStatus(o.id, "cooking")}>Вернуть в работу</Btn>
                )}
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <p className="text-center text-subtle py-16">Заказов в этой выборке нет</p>
        )}
      </div>
    </>
  );
};

export default Orders;
