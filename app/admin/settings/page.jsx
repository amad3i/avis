"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { PageTitle, Btn, Input, Textarea, Spinner } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/AdminDataProvider";
import { siteConfig } from "@/lib/site.config";

const A = siteConfig.t.admin;

const FIELDS = Object.entries(A.settingsFields).map(([key, label]) => ({ key, label }));

const COLOR_FIELDS = Object.entries(A.colorFields).map(([key, label]) => ({ key, label }));

const Settings = () => {
  const { data, loaded, setSettings } = useAdminData();
  const settings = data.settings;
  const [saving, setSaving] = useState(false);

  if (!loaded) return <div className="flex items-center gap-2 text-subtle text-sm py-10"><Spinner size={20} /> {A.loading}</div>;

  const set = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(A.saved);
    } else {
      toast.error(A.saveError);
    }
  };

  return (
    <>
      <PageTitle
        title={A.settings}
        action={<Btn onClick={save} disabled={saving}>{saving ? A.saving : A.save}</Btn>}
      />

      <div className="grid xl:grid-cols-2 gap-6 pb-20 md:pb-0">
        <div className="bg-white rounded-2xl border border-black/10 p-6 space-y-4">
          <p className="font-extrabold text-ink">{A.brandAndContacts}</p>
          {FIELDS.map((f) => (
            <Input key={f.key} label={f.label} value={settings[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} />
          ))}
          <Textarea label={A.aboutTitle} rows={2} value={settings.aboutTitle || ""} onChange={(e) => set("aboutTitle", e.target.value)} />
          <Textarea label={A.aboutText} rows={3} value={settings.aboutText || ""} onChange={(e) => set("aboutText", e.target.value)} />
          <Textarea
            label={A.reviewsJson}
            rows={5}
            value={settings.reviewsJson || "[]"}
            onChange={(e) => set("reviewsJson", e.target.value)}
            className="font-mono !text-xs"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/10 p-6">
            <p className="font-extrabold text-ink mb-4">{A.colorsTitle}</p>
            <div className="space-y-4">
              {COLOR_FIELDS.map((f) => (
                <div key={f.key} className="flex items-center gap-4">
                  <input
                    type="color"
                    value={settings[f.key] || "#000000"}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-12 h-12 rounded-xl border border-black/10 cursor-pointer bg-white p-1"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-subtle">{f.label}</p>
                    <p className="text-sm font-mono text-ink">{settings[f.key]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/10 p-6">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.heroScrim === "true" || settings.heroScrim === true}
                onChange={(e) => set("heroScrim", e.target.checked ? "true" : "false")}
                className="w-5 h-5 accent-primary"
              />
              <span className="text-sm font-semibold text-ink">
                {A.heroScrim}
                <span className="block text-xs font-normal text-subtle">{A.heroScrimHint}</span>
              </span>
            </label>
          </div>

          <Btn onClick={save} disabled={saving} className="w-full !py-3.5">
            {saving ? A.saving : A.saveAll}
          </Btn>
        </div>
      </div>
    </>
  );
};

export default Settings;
