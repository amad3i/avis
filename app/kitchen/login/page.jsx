"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/icons";
import { siteConfig } from "@/lib/site.config";

const Login = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, role: "kitchen" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.role !== "kitchen") {
        setError("Это панель кухни. Введите пароль кухни.");
        return;
      }
      router.push(data.home || `/${process.env.NEXT_PUBLIC_KITCHEN_PATH || "kitchen"}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0E1013]">
      <form
        onSubmit={submit}
        className="bg-[#171A20] rounded-3xl border border-white/10 p-7 sm:p-8 w-full max-w-sm"
      >
        <div className="flex justify-center mb-5">
          <Logo light />
        </div>
        <p className="text-center font-black text-xl tracking-tight text-white mb-1">
          {siteConfig.brand.shopName}
        </p>
        <div className="flex flex-col items-center gap-2 mb-1">
          <span className="w-9 h-9 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center">
            <Icon name="chef" className="w-5 h-5" strokeWidth={2} />
          </span>
          <h1 className="h3 text-white text-center">Панель кухни</h1>
        </div>
        <p className="text-center text-sm text-white/50 mb-6">Вход в регистратуру</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль кухни"
          autoFocus
          className="w-full bg-[#0E1013] border border-white/10 rounded-xl px-4 py-3.5 outline-none focus:border-primary transition text-center tracking-widest text-lg text-white"
        />
        {error && (
          <p className="text-red-400 text-sm font-semibold text-center mt-3">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 bg-primary text-white py-3.5 min-h-[48px] rounded-full font-extrabold transition-all duration-300 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>
    </div>
  );
};

export default Login;