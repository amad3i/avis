import { isMock, isDb } from "./config";
import { dbMock } from "./db-mock";
import { PrismaClient } from "@prisma/client";

// В режиме DATA_MODE="mock" (заглушка) — экспортируем in-memory хранилище,
// чтобы заказы, админка и кухня работали без базы данных. Реальный Prisma
// при этом даже не создаётся, поэтому проект собирается и хостится без
// DATABASE_URL (Neon).
//
// Переключение на реальную БД: DATA_MODE="db" + DATABASE_URL.
const globalForPrisma = globalThis;

// Неон раздаёт пулируемое подключение через PgBouncer. Ограничиваем число
// соединений из одного инстанса Prisma, чтобы не упереться в лимит и не
// словить ошибки prepared statements в serverless-среде.
function resolveUrl() {
  const url = process.env.DATABASE_URL || "";
  if (!url || /[?&]connection_limit=/.test(url)) return url;
  return url + (url.includes("?") ? "&" : "?") + "connection_limit=1";
}

let realDb = null;

// Лениво создаём PrismaClient только когда нужна реальная база.
function getRealDb() {
  if (realDb) return realDb;
  if (!isDb) {
    throw new Error("DATA_MODE не установлен в 'db'. Задайте DATA_MODE=db и DATABASE_URL для реальной базы.");
  }
  realDb =
    globalForPrisma.prisma ||
    new PrismaClient({ datasources: { db: { url: resolveUrl() } } });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = realDb;
  return realDb;
}

export const db = isMock ? dbMock : getRealDb();
