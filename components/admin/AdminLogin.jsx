"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/icons";
import { siteConfig } from "@/lib/site.config";

const AdminLogin = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const A = siteConfig.t.admin;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, role: "admin" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.role !== "admin") {
        setError(A.wrongPassword);
        return;
      }
      router.push(data.home || `/${process.env.NEXT_PUBLIC_ADMIN_PATH || "admin"}`);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <form
        onSubmit={submit}
        className="bg-white rounded-3xl border border-black/10 p-7 sm:p-8 w-full max-w-sm"
      >
        <div className="flex justify-center mb-5">
          <Logo />
        </div>
        <div className="flex flex-col items-center gap-2 mb-1">
          <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Icon name="settings" className="w-5 h-5" strokeWidth={2} />
          </span>
          <h1 className="h3 text-ink text-center">{A.loginTitle}</h1>
        </div>
        <p className="text-center text-sm text-subtle mb-6">{A.loginSubtitle}</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={A.passwordPlaceholder}
          autoFocus
          className="w-full border border-black/10 rounded-xl px-4 py-3.5 outline-none focus:border-primary transition text-center tracking-widest text-lg"
        />
        {error && (
          <p className="text-red-500 text-sm font-semibold text-center mt-3">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-5 bg-primary text-white py-3.5 min-h-[48px] rounded-full font-extrabold transition-all duration-300 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? A.loggingIn : A.login}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
