import { isMock } from "./config";

// Shared JWT secret source for both route handlers (lib/auth) and middleware.
// Centralizing it guarantees the middleware can never silently fall back to a
// publicly-known dev secret while the rest of the app refuses it — which would
// otherwise let an attacker forge a valid admin session JWT.

let cached = null;

export function secret() {
  if (cached) return cached;
  const value = process.env.AUTH_SECRET;
  if (!value) {
    // В демо-режиме (DATA_MODE="mock") разрешаем работать без AUTH_SECRET,
    // чтобы деплой на Vercel не требовал дополнительных env-переменных.
    // В боевом режиме (DATA_MODE="db") — строгая проверка.
    if (process.env.NODE_ENV === "production" && !isMock) {
      throw new Error(
        "AUTH_SECRET is not set — refusing to use an insecure default in production"
      );
    }
    console.warn("[auth] AUTH_SECRET is not set; using mock/demo fallback secret");
    cached = new TextEncoder().encode("mock-demo-secret-change-me");
    return cached;
  }
  cached = new TextEncoder().encode(value);
  return cached;
}
