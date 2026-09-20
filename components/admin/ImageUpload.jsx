"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import Icon from "@/components/icons";
import { siteConfig } from "@/lib/site.config";

const A = siteConfig.t.admin;

const ImageUpload = ({ value, onChange }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange(data.url);
      toast.success("Фото загружено");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full sm:w-32 shrink-0">
      <label className="text-xs font-bold uppercase tracking-wide text-subtle block mb-1.5">Фото</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative w-full h-36 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-black/15 hover:border-primary transition cursor-pointer overflow-hidden bg-cream flex items-center justify-center"
      >
        {value ? (
          <>
              <Image src={value} alt="" className="w-full h-full object-cover" width={128} height={128} unoptimized={value.startsWith("/uploads") || value.startsWith("/api/uploads") || value.startsWith("http")} />
            <button
              type="button"
              aria-label="Убрать фото"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <span className="text-xs text-subtle font-semibold text-center px-3">
            {uploading ? A.upload : "+ Загрузить фото"}
          </span>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={pick} />
    </div>
  );
};

export default ImageUpload;
