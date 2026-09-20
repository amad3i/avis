"use client";
import React, { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { PageTitle, Btn, Modal, Input, Textarea, Toggle, Spinner } from "@/components/admin/ui";
import ImageUpload from "@/components/admin/ImageUpload";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const emptyForm = {
  chip: "", title: "", subtitle: "",   ctaText: "Смотреть услуги", ctaLink: "/#menu",
  cta2Text: "", cta2Link: "", image: "", active: true, sortOrder: 0,
};

const Slides = () => {
  const { data, loaded, setSlides } = useAdminData();
  const slides = data.slides;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  if (!loaded) return <div className="flex items-center gap-2 text-subtle text-sm py-10"><Spinner size={20} /> Загрузка…</div>;

  const save = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Заголовок обязателен");
    const url = editingId ? `/api/slides/${editingId}` : "/api/slides";
    const res = await fetch(url, {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return toast.error(data.error);
    toast.success(editingId ? "Слайд обновлён" : "Слайд добавлен");
    setModalOpen(false);
    if (data.slide) {
      setSlides((prev) =>
        editingId ? prev.map((x) => (x.id === editingId ? data.slide : x)) : [...prev, data.slide]
      );
    }
  };

  const remove = async (s) => {
    if (!confirm(`Удалить слайд «${s.title}»?`)) return;
    await fetch(`/api/slides/${s.id}`, { method: "DELETE" });
    toast.success("Слайд удалён");
    setSlides((prev) => prev.filter((x) => x.id !== s.id));
  };

  const toggle = async (s) => {
    const res = await fetch(`/api/slides/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    if (res.ok) {
      setSlides((prev) => prev.map((x) => (x.id === s.id ? { ...x, active: !x.active } : x)));
    }
  };

  return (
    <>
      <PageTitle
        title={siteConfig.t.admin.slidesTitle}
        subtitle="Рекламные баннеры в слайд-шоу"
        action={<Btn onClick={() => { setForm(emptyForm); setEditingId(null); setModalOpen(true); }}>+ Добавить слайд</Btn>}
      />

      <div className="space-y-4">
        {slides.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl border border-black/10 p-4 flex items-center gap-4">
            <div className="w-24 h-16 rounded-xl bg-cream overflow-hidden flex items-center justify-center shrink-0">
              {s.image ? (
                <Image src={s.image} alt="" className="w-full h-full object-cover" width={96} height={64} />
              ) : (
                <span className="text-2xl">🌯</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-ink truncate">{s.title}</p>
              <p className="text-xs text-subtle truncate mt-0.5">
                {s.chip && <span className="font-bold text-primary-dark">{s.chip}</span>}
                {s.chip && " · "}
                {s.ctaText} → {s.ctaLink}
                {!s.active && " · скрыт"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggle(s)}
                className={`text-xs font-extrabold px-3 py-1.5 rounded-full transition ${s.active ? "bg-primary-light/25 text-primary-dark" : "bg-cream text-subtle"}`}
              >
                {s.active ? "Показан" : "Скрыт"}
              </button>
              <Btn variant="outline" className="!px-4" onClick={() => { setForm({ ...s, image: s.image || "" }); setEditingId(s.id); setModalOpen(true); }}>✏️</Btn>
              <Btn variant="danger" className="!px-4" onClick={() => remove(s)}>🗑</Btn>
            </div>
          </div>
        ))}
        {slides.length === 0 && <p className="text-center text-subtle py-16">Слайдов нет - добавьте первый</p>}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Редактировать слайд" : "Новый слайд"}
        wide
        footer={
          <div className="flex gap-3 px-6 py-4">
            <Btn type="submit" form="slide-form" className="flex-1 !py-3">Сохранить</Btn>
            <Btn type="button" variant="ghost" onClick={() => setModalOpen(false)}>Отмена</Btn>
          </div>
        }
      >
        <form id="slide-form" onSubmit={save} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
            <ImageUpload value={form.image} onChange={(url) => setForm({ ...form, image: url })} />
            <div className="flex-1 space-y-4">
              <Input label="Плашка сверху" value={form.chip} onChange={(e) => setForm({ ...form, chip: e.target.value })} placeholder="Хит продаж" />
              <Input label="Заголовок" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <Input label="Порядок" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="w-32" />
            </div>
          </div>
          <Textarea label="Подзаголовок" rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Кнопка 1 - текст" value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
            <Input label="Кнопка 1 - ссылка" value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} placeholder="/#menu, /#contacts, https://..." />
            <Input label="Кнопка 2 - текст" value={form.cta2Text} onChange={(e) => setForm({ ...form, cta2Text: e.target.value })} />
            <Input label="Кнопка 2 - ссылка" value={form.cta2Link} onChange={(e) => setForm({ ...form, cta2Link: e.target.value })} placeholder="/#menu, /#contacts, https://..." />
          </div>
          <Toggle label="Показывать слайд" checked={form.active} onChange={(v) => setForm({ ...form, active: v })} />
        </form>
      </Modal>
    </>
  );
};

export default Slides;
