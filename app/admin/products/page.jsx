"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { PageTitle, Btn, Modal, Input, Textarea, Select, Toggle, Spinner } from "@/components/admin/ui";
import ImageUpload from "@/components/admin/ImageUpload";
import IconPicker from "@/components/admin/IconPicker";
import Icon from "@/components/icons";
import { parseGallery } from "@/lib/format";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const emptyForm = {
  name: "", description: "", categoryId: "", icon: "wrap", hit: false, active: true,
  sortOrder: 0, image: "", gallery: "", sizes: [{ label: "Стандарт", price: "" }],
};

const Products = () => {
  const { data, loaded, setProducts, setCategories } = useAdminData();
  const products = data.products;
  const categories = data.categories;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  if (!loaded) return <div className="flex items-center gap-2 text-subtle text-sm py-10"><Spinner size={20} /> Загрузка…</div>;

  const openCreate = () => {
    setForm({ ...emptyForm, categoryId: categories[0]?.id || "" });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description,
      categoryId: p.categoryId,
      icon: p.icon,
      hit: p.hit,
      active: p.active,
      sortOrder: p.sortOrder,
      image: p.image || "",
      gallery: parseGallery(p.gallery).join(", "),
      sizes: p.sizes.map((s) => ({ label: s.label, price: s.price })),
    });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) {
      toast.error("Укажите название и категорию");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/products/${editingId}` : "/api/products";
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          gallery: (form.gallery || "").split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(editingId ? "Товар обновлён" : "Товар добавлен");
      setModalOpen(false);
      const apiProduct = data.product;
      const withCategory = {
        ...apiProduct,
        category: categories.find((c) => c.id === apiProduct.categoryId) || { name: "" },
      };
      setProducts((prev) =>
        editingId
          ? prev.map((x) => (x.id === editingId ? withCategory : x))
          : [...prev, withCategory]
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!confirm(`Удалить «${p.name}»?`)) return;
    const res = await fetch(`/api/products/${p.id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      toast.success(data.softDeleted ? "Товар скрыт (есть в заказах)" : "Товар удалён");
      setProducts((prev) =>
        data.softDeleted
          ? prev.map((x) => (x.id === p.id ? { ...x, active: false } : x))
          : prev.filter((x) => x.id !== p.id)
      );
    } else {
      toast.error(data.error);
    }
  };

  const toggleField = async (p, field) => {
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !p[field] }),
    });
    if (res.ok) {
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, [field]: !x[field] } : x)));
    }
  };

  const setSize = (idx, field, value) => {
    const sizes = [...form.sizes];
    sizes[idx] = { ...sizes[idx], [field]: value };
    setForm({ ...form, sizes });
  };

  return (
    <>
      <PageTitle
        title={siteConfig.t.admin.productsTitle}
        subtitle={`${products.length} услуг в каталоге`}
        action={<Btn onClick={openCreate}>+ Добавить товар</Btn>}
      />

      <div className="space-y-3 pb-20 md:pb-0">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-black/10 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-cream overflow-hidden flex items-center justify-center shrink-0">
              {p.image ? (
                <Image src={p.image} alt="" className="w-full h-full object-cover" width={56} height={56} />
              ) : (
                <Icon name={p.icon} className="w-7 h-7 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-ink flex items-center gap-2">
                {p.name}
                {p.hit && <span className="bg-primary text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">ХИТ</span>}
                {!p.active && <span className="bg-cream text-subtle text-[10px] font-extrabold px-1.5 py-0.5 rounded">СКРЫТ</span>}
              </p>
              <p className="text-xs text-subtle mt-0.5 truncate">
                {p.category.name} · {p.sizes.map((s) => `${s.label} ${s.price}${siteConfig.technical.currency}`).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2 max-md:hidden">
              <button
                onClick={() => toggleField(p, "hit")}
                 className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition ${p.hit ? "bg-primary text-white" : "bg-cream text-subtle hover:text-ink"}`}
              >
                Хит
              </button>
              <button
                onClick={() => toggleField(p, "active")}
                className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition ${p.active ? "bg-primary-light/25 text-primary-dark" : "bg-cream text-subtle"}`}
              >
                {p.active ? "Показан" : "Скрыт"}
              </button>
            </div>
            <div className="flex gap-2">
              <Btn variant="outline" className="!px-4" onClick={() => openEdit(p)}><Icon name="edit" className="w-4 h-4" /></Btn>
              <Btn variant="danger" className="!px-4" onClick={() => remove(p)}><Icon name="trash" className="w-4 h-4" /></Btn>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-center text-subtle py-16">Товаров пока нет</p>}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Редактировать товар" : "Новый товар"}
        wide
        footer={
          <div className="flex gap-3 px-6 py-4">
            <Btn type="submit" form="product-form" disabled={saving} className="flex-1 !py-3">
              {saving ? siteConfig.t.admin.saving : siteConfig.t.admin.save}
            </Btn>
            <Btn type="button" variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Btn>
          </div>
        }
      >
        <form id="product-form" onSubmit={save} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
            <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
            <div className="flex-1 space-y-4">
              <Input label="Название" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <div className="flex gap-3">
                <Select label="Категория" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="flex-1">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
                <Input label="Сорт." type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-20" />
              </div>
              <div className="flex gap-6">
                <Toggle label="Хит" checked={form.hit} onChange={(v) => setForm({ ...form, hit: v })} />
                <Toggle label="Показывать" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
              </div>
            </div>
          </div>

          <Textarea label="Описание / состав" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <Input
            label="Доп. фото (URL через запятую, до 6)"
            value={form.gallery}
            onChange={(e) => setForm({ ...form, gallery: e.target.value })}
              placeholder="ссылки на картинки через запятую (из Vercel Blob)"
          />

          <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-subtle block mb-1.5">Размеры и цены</label>
            <div className="space-y-2">
              {form.sizes.map((s, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={s.label}
                    onChange={(e) => setSize(idx, "label", e.target.value)}
                    placeholder="Стандарт"
                    className="flex-1 border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <input
                    value={s.price}
                    onChange={(e) => setSize(idx, "price", e.target.value)}
                    placeholder="300"
                    type="number"
                    className="w-28 border border-black/10 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, sizes: form.sizes.filter((_, i) => i !== idx) })}
                    aria-label="Удалить размер"
                    className="w-9 h-9 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition shrink-0 flex items-center justify-center"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, sizes: [...form.sizes, { label: "", price: "" }] })}
              className="mt-2 text-sm font-bold text-primary hover:text-primary-dark transition"
            >
              + Добавить размер
            </button>
          </div>

        </form>
      </Modal>
    </>
  );
};

export default Products;
