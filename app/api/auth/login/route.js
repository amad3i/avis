import { NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { createSession, SESSION_COOKIE } from "@/lib/auth";
import { ADMIN_PASSWORD, KITCHEN_PASSWORD, isMock } from "@/lib/config";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { log } from "@/lib/log";

export async function POST(req) {
  const ip = clientIp(req);
  const rl = rateLimit(`login:${ip}`, 5, 60000);
  if (!rl.ok) {
    log.warn("Login rate limited", { ip });
    return NextResponse.json(
      { error: "Слишком много попыток входа. Подождите минуту." },
      { status: 429 }
    );
  }

  const raw = await req.json().catch(() => ({}));
  const password = typeof raw.password === "string" ? raw.password.slice(0, 256) : "";
  const expected = typeof raw.role === "string" ? raw.role : "";

  // Constant-time comparison (timing-safe) with length normalization via SHA-256,
  // so the password is never interpreted, stored, or reflected — only compared.
  const digest = (s) => createHash("sha256").update(s).digest();
  const safeEqual = (a, b) => {
    const secret = typeof b === "string" && b.length > 0 ? b : "";
    const ha = digest(a);
    const hb = digest(secret);
    return ha.length === hb.length && timingSafeEqual(ha, hb);
  };

  // В mock-режиме пароли берутся из конфига (дефолт admin/kitchen), чтобы демо
  // работало без env-переменных. В db-режиме требуются явно заданные пароли.
  const hasAdmin = isMock ? Boolean(ADMIN_PASSWORD) : typeof process.env.ADMIN_PASSWORD === "string" && process.env.ADMIN_PASSWORD.length > 0;
  const hasKitchen = isMock ? Boolean(KITCHEN_PASSWORD) : typeof process.env.KITCHEN_PASSWORD === "string" && process.env.KITCHEN_PASSWORD.length > 0;
  const isAdmin = hasAdmin && safeEqual(password, ADMIN_PASSWORD);
  const isKitchen = hasKitchen && safeEqual(password, KITCHEN_PASSWORD);

  let role = isAdmin ? "admin" : isKitchen ? "kitchen" : null;

  if (!role || (expected && role !== expected)) {
    log.warn("Login failed", { ip });
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const token = await createSession(role);
  const res = NextResponse.json({
    role,
    home:
      role === "admin"
        ? `/${process.env.ADMIN_PATH || "admin"}`
        : `/${process.env.KITCHEN_PATH || "kitchen"}`,
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return res;
}
