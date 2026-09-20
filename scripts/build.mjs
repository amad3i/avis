// Сборка проекта с учётом DATA_MODE.
//   DATA_MODE="mock" (по умолчанию): БД не нужна — пропускаем миграции и сид,
//   билдим на захардкоженных данных. Подходит для Vercel без Neon.
//   DATA_MODE="db": подтягиваем схему в реальную базу и заливаем дефолтное меню.
import { spawnSync } from "node:child_process";

const mode = (process.env.DATA_MODE || "mock").toLowerCase();
const isDb = mode === "db" || mode === "neon";

function run(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) process.exit(res.status ?? 1);
}

if (isDb) {
  console.log("[build] DATA_MODE=db — применяю схему и сид в реальную базу…");
  run("npx", ["prisma", "db", "push", "--accept-data-loss"]);
  run("node", ["prisma/seed.mjs"]);
} else {
  console.log("[build] DATA_MODE=mock — сборка без базы данных (заглушка).");
}