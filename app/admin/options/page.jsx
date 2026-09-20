"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import Icon from "@/components/icons";
import { PageTitle, Btn, Input, Spinner } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const Options = () => {
  const { data, loaded, setOptions } = useAdminData();
  const options = data.options;
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [group, setGroup] = useState("addon");

  if (!loaded) return <div className="flex items-center gap-2 text-subtle text-sm py-10"><Spinner size={20} /> Загрузка…</div>;

  const add = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) return toast.error("Название и цена обязательны");
    const res = await fetch("/api/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price), sortOrder: options.length + 1, group }),
    });
    const json = await res.json();
    if (!res.ok) return toast.error(siteConfig.t.admin.error);
    setName(""); setPrice("");
    toast.success("Опция добавлена");
    if (json.option) setOptions((prev) => [...prev, json.option]);
  };

  const patch = async (id, patchData) => {
    const res = await fetch(`/api/options/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchData),
    });
    const json = await res.json();
    if (json.option) setOptions((prev) => prev.map((o) => (o.id === id ? json.option : o)));
  };

  const remove = async (o) => {
    if (!confirm(`Удалить опцию «${o.name}»?`)) return;
    await fetch(`/api/options/${o.id}`, { method: "DELETE" });
    toast.success("Удалена");
    setOptions((prev) => prev.filter((x) => x.id !== o.id));
  };

  return (
    <>
      <PageTitle
        title={siteConfig.t.admin.optionsTitle}
        subtitle="Добавки к напиткам и десертам: сиропы, растительное молоко, специи - клиент выбирает на странице товара"
      />

       <form onSubmit={add} className="flex flex-col sm:flex-row gap-3 items-end bg-white rounded-2xl border border-black/10 p-5 max-w-2xl">
        <Input label="Название" value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: анестезия" className="flex-1 w-full" />
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <span className="text-xs font-bold text-subtle">Тип</span>
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="h-[42px] rounded-xl border border-black/10 px-3 text-sm outline-none focus:border-primary bg-white w-full"
          >
            <option value="addon">Добавка</option>
            <option value="sauce">Соус</option>
          </select>
        </div>
        <Input label={`Цена, ${siteConfig.technical.currency}`} type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="50" className="w-full sm:w-28" />
        <Btn type="submit" className="w-full sm:w-auto">+ Добавить</Btn>
      </form>

      <div className="space-y-3 mt-5 max-w-2xl">
        {options.map((o) => (
          <div key={o.id} className="bg-white rounded-2xl border border-black/10 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cream text-primary flex items-center justify-center">
              <Icon name="plus" className="w-5 h-5" />
            </div>
            <p className="flex-1 font-bold text-ink">{o.name}</p>
            <p className="font-extrabold text-ink">+{o.price} {siteConfig.technical.currency}</p>
            <select
              value={o.group || "addon"}
              onChange={(e) => patch(o.id, { group: e.target.value })}
              className="text-xs font-bold rounded-full border border-black/10 px-2.5 py-1.5 bg-white outline-none focus:border-primary"
            >
              <option value="addon">Добавка</option>
              <option value="sauce">Соус</option>
            </select>
            <button
              onClick={() => patch(o.id, { active: !o.active })}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition ${
                o.active ? "bg-primary-light/25 text-primary-dark" : "bg-cream text-subtle"
              }`}
            >
              {o.active ? "Показана" : "Скрыта"}
            </button>
            <Btn variant="danger" className="!px-4" onClick={() => remove(o)}>
              <Icon name="trash" className="w-4 h-4" />
            </Btn>
          </div>
        ))}
        {options.length === 0 && (
          <p className="text-center text-subtle py-12 text-sm">Опций пока нет - добавьте первую</p>
        )}
      </div>
    </>
  );
};

export default Options;
