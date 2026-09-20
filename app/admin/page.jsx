"use client";
import React from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Icon from "@/components/icons";
import { PageTitle, StatusBadge, Spinner } from "@/components/admin/ui";
import { useAdminPath } from "@/components/admin/AdminPathContext";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const CUR = siteConfig.technical.currency;
const A = siteConfig.t.admin;

const fmtDate = (iso) =>
  new Date(iso).toLocaleString(siteConfig.technical.locale, { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const RevenueChart = ({ days }) => (
  <div className="h-52 mt-5 -ml-2">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={days} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="28%">
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fontWeight: 700, fill: "#9CA3AF" }}
          dy={6}
        />
        <YAxis hide domain={[0, "dataMax + 100"]} />
        <Tooltip
          cursor={{ fill: "rgba(26,26,46,.04)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,.06)",
            boxShadow: "0 8px 24px -8px rgba(16,24,40,.16)",
            fontSize: 12,
            fontWeight: 700,
          }}
          formatter={(value, name) => (name === "revenue" ? [`${value} ${CUR}`, "Выручка"] : [value, "Заказы"])}
          labelFormatter={(label, payload) =>
            payload && payload[0] ? `${label}: ${payload[0].payload.count} зак.` : label
          }
        />
        <Bar dataKey="revenue" fill="var(--c-primary)" radius={[8, 8, 8, 8]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const Dashboard = () => {
  const { adminPath } = useAdminPath();
  const { data, setTab } = useAdminData();
  const analytics = data.analytics;
  const orders = data.orders;
  const loading = !analytics;

  const today = analytics?.today || { count: 0, revenue: 0, avgTicket: 0 };
  const days = analytics?.days || [];
  const topProducts = analytics?.topProducts || [];
  const statusCounts = analytics?.statusCounts || { new: 0, cooking: 0, ready: 0, done: 0, canceled: 0 };
  const maxTop = Math.max(1, ...topProducts.map((t) => t.quantity));

  const stats = [
    { label: "Заказов сегодня", value: today.count, icon: "receipt", accent: "text-primary" },
    { label: "Выручка сегодня", value: `${today.revenue} ${CUR}`, icon: "wallet", accent: "text-primary" },
    { label: "Средний чек", value: `${today.avgTicket} ${CUR}`, icon: "card", accent: "text-primary" },
    {
      label: "Активных заказов",
      value: statusCounts.new + statusCounts.cooking + statusCounts.ready,
      icon: "fire",
      accent: "text-primary",
    },
  ];

  return (
    <>
      <PageTitle title={A.dashboard} subtitle={A.dashboardSubtitle} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 pb-20 md:pb-0">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-black/10 shadow-card p-5 hover:shadow-lift transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-2xl font-black text-ink min-h-[32px] flex items-center">
                {loading ? <Spinner size={22} /> : s.value}
              </div>
              <div className={`w-10 h-10 rounded-xl bg-cream flex items-center justify-center ${s.accent}`}>
                <Icon name={s.icon} className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs font-bold text-subtle uppercase tracking-wide mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-[1.6fr_1fr] gap-4 mt-6">
        <div className="bg-white rounded-2xl border border-black/10 shadow-card p-6">
          <div className="flex items-center justify-between">
            <p className="font-extrabold text-ink">Выручка за 7 дней</p>
            <span className="text-xs font-bold text-subtle">
              Итого: {loading ? "—" : `${days.reduce((a, d) => a + d.revenue, 0)} ${CUR}`}
            </span>
          </div>
          {loading ? (
            <div className="h-52 mt-5 flex items-center justify-center text-subtle">
              <Spinner size={28} />
            </div>
          ) : (
            <RevenueChart days={days} />
          )}
        </div>

        <div className="bg-white rounded-2xl border border-black/10 shadow-card p-6">
          <p className="font-extrabold text-ink">Топ товаров</p>
          <div className="space-y-3.5 mt-5">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-1/2 bg-cream rounded animate-pulse" />
                  <div className="h-2 rounded-full bg-cream overflow-hidden">
                    <div className="h-full rounded-full bg-black/[.06] animate-pulse" style={{ width: `${70 - i * 12}%` }} />
                  </div>
                </div>
              ))
            ) : (
              topProducts.map((t) => (
                <div key={t.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-ink truncate max-w-[75%]">{t.name}</span>
                    <span className="text-subtle font-bold">{t.quantity} шт</span>
                  </div>
                  <div className="h-2 bg-cream rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${(t.quantity / maxTop) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            {!loading && topProducts.length === 0 && <p className="text-sm text-subtle py-4">Пока нет данных</p>}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/10 shadow-card mt-6">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <p className="font-extrabold text-ink">Последние заказы</p>
          <span
            onClick={() => {
              setTab("orders");
              if (typeof window !== "undefined") window.history.replaceState(null, "", `/${adminPath}/orders`);
            }}
            className="text-sm font-bold text-primary hover:text-primary-dark transition cursor-pointer"
          >
            Все заказы →
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center text-subtle py-10">
            <Spinner size={26} />
          </div>
        ) : (
          <>
            {orders.slice(0, 6).map((o) => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-black/10 last:border-0 text-sm">
                <span className="font-black text-ink w-14">№{o.id}</span>
                <span className="text-subtle flex-1 min-w-0 truncate">
                  {o.customerName} · {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                </span>
                <span className="text-subtle max-lg:hidden">{fmtDate(o.createdAt)}</span>
                <span className="font-extrabold text-ink whitespace-nowrap">{o.total} {CUR}</span>
                <StatusBadge status={o.status} />
              </div>
            ))}
            {orders.length === 0 && <p className="text-center text-subtle py-10 text-sm">Заказов пока нет</p>}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
