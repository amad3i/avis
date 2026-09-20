// Переключатель источника данных проекта.
//
//   DATA_MODE="mock"  — заглушка: всё работает на захардкоженных данных в памяти
//                       (каталог, заказы, админка, кухня). Не требует базы данных,
//                       позволяет билдить и хостить на Vercel без Neon.
//   DATA_MODE="db"    — реальная база (PostgreSQL / Neon через Prisma).
//
// Если переменная не задана — по умолчанию включается заглушка, чтобы проект
// можно было развернуть "из коробки" без внешних сервисов.
export const DATA_MODE = (process.env.DATA_MODE || "mock").toLowerCase();

export const isMock = DATA_MODE === "mock" || DATA_MODE === "stub" || DATA_MODE === "memory";
export const isDb = DATA_MODE === "db" || DATA_MODE === "neon";

// Пароли панелей.
//   mock-режим: берутся дефолтные, чтобы демо работало вообще без env-переменных.
//   db-режим:   обязательно задавать через окружение (или .env).
export const ADMIN_PASSWORD = isMock
  ? process.env.ADMIN_PASSWORD || "admin"
  : process.env.ADMIN_PASSWORD || "";

export const KITCHEN_PASSWORD = isMock
  ? process.env.KITCHEN_PASSWORD || "kitchen"
  : process.env.KITCHEN_PASSWORD || "";
