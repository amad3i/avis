"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PageTitle, Btn, Modal, Input, Toggle, Spinner } from "@/components/admin/ui";
import IconPicker from "@/components/admin/IconPicker";
import Icon from "@/components/icons";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const Categories = () => {
  const { data, loaded, setCategories } = useAdminData();
  const categories = data.categories;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", icon: "box", sortOrder: 0, active: true });

  if (!loaded) return <div className="flex items-center gap-2 text-subtle text-sm py-10"><Spinner size={20} /> Загрузка…</div>;

  const save = async (e) => {
    e.preventDefault();
    const url = editingId ? `/api/categories/${editingId}` : "/api/categories";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success(editingId ? "Категория обновлена" : "Категория добавлена");
    setModalOpen(false);
    const cat = data.category;
    setCategories((prev) =>
      editingId
        ? prev.map((x) => (x.id === editingId ? { ...cat, _count: x._count } : x))
        : [...prev, { ...cat, _count: { products: 0 } }]
    );
  };

  const remove = async (c) => {
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;
    const res = await fetch(`/api/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success("Категория удалена");
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
  };

  return (
    <>
      <PageTitle
        title={siteConfig.t.admin.categoriesTitle}
        subtitle="Категории услуг"
        action={
          <Btn onClick={() => { setForm({ name: "", icon: "box", sortOrder: (categories.at(-1)?.sortOrder || 0) + 1, active: true }); setEditingId(null); setModalOpen(true); }}>
            + Добавить категорию
          </Btn>
        }
      />

      <div className="space-y-3 pb-20 md:pb-0">
        {categories.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl border border-black/10 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cream text-primary flex items-center justify-center"><Icon name={c.icon} className="w-5 h-5" /></div>
            <div className="flex-1">
              <p className="font-extrabold text-ink">{c.name}</p>
              <p className="text-xs text-subtle mt-0.5">Товаров: {c._count.products} · Порядок: {c.sortOrder}</p>
            </div>
            {!c.active && <span className="bg-cream text-subtle text-[10px] font-extrabold px-2 py-0.5 rounded">СКРЫТА</span>}
            <div className="flex gap-2">
              <Btn variant="outline" className="!px-4" onClick={() => { setForm({ name: c.name, icon: c.icon, sortOrder: c.sortOrder, active: c.active }); setEditingId(c.id); setModalOpen(true); }}><Icon name="edit" className="w-4 h-4" /></Btn>
              <Btn variant="danger" className="!px-4" onClick={() => remove(c)}><Icon name="trash" className="w-4 h-4" /></Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Редактировать категорию" : "Новая категория"}
        footer={
          <div className="flex gap-3 px-6 py-4">
            <Btn type="submit" form="category-form" className="flex-1 !py-3">Сохранить</Btn>
            <Btn type="button" variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Btn>
          </div>
        }
      >
        <form id="category-form" onSubmit={save} className="space-y-4">
          <Input label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Порядок сортировки" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-32" />

          <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
          <Toggle label="Показывать на сайте" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
        </form>
      </Modal>
    </>
  );
};

export default Categories;
