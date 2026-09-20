import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { secret } from "@/lib/secret";
import { isMock } from "@/lib/config";

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const adminPath = process.env.ADMIN_PATH || "admin";
  const kitchenPath = process.env.KITCHEN_PATH || "kitchen";

  // В демо-режиме (DATA_MODE="mock") панели открыты без входа: считаем, что
  // роль уже авторизована, и middleware просто отдаёт страницы.
  const token = req.cookies.get("session")?.value;
  let role = isMock ? "admin" : null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      role = payload.role;
    } catch {}
  }

  // Скрытый вход в админку: /${ADMIN_PATH}/* -> rewrite на /admin/*
  if (pathname === `/${adminPath}` || pathname.startsWith(`/${adminPath}/`)) {
    const sub = pathname.slice(1 + adminPath.length);
    const target = ("/admin" + (sub ? sub : "")).replace(/\/{2,}/g, "/");

    // /admin/login - форма пароля для всех, кроме уже авторизованного admin
    if (target === "/admin/login") {
      if (role === "admin") return NextResponse.redirect(new URL(`/${adminPath}`, req.url));
      return NextResponse.rewrite(new URL("/admin/login", req.url));
    }

    // Всё остальное /admin/* - только для admin, иначе форма пароля
    if (role !== "admin") {
      return NextResponse.rewrite(new URL("/admin/login", req.url));
    }
    return NextResponse.rewrite(new URL(target, req.url));
  }

  // Скрытый вход на кухню: /${KITCHEN_PATH}/* -> rewrite на /kitchen/*
  if (pathname === `/${kitchenPath}` || pathname.startsWith(`/${kitchenPath}/`)) {
    const sub = pathname.slice(1 + kitchenPath.length);
    const target = ("/kitchen" + (sub ? sub : "")).replace(/\/{2,}/g, "/");

    if (target === "/kitchen/login") {
      if (role === "kitchen" || role === "admin") {
        return NextResponse.redirect(new URL(`/${kitchenPath}`, req.url));
      }
      return NextResponse.rewrite(new URL("/kitchen/login", req.url));
    }

    if (role !== "kitchen" && role !== "admin") {
      return NextResponse.rewrite(new URL("/kitchen/login", req.url));
    }
    return NextResponse.rewrite(new URL(target, req.url));
  }

  // Прямой доступ к реальным путям закрыт
  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/kitchen" ||
    pathname.startsWith("/kitchen/")
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
