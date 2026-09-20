import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");

async function write(level, message, meta) {
  const line = `[${new Date().toISOString()}] [${level}] ${message}${meta ? ` | ${JSON.stringify(meta)}` : ""}`;
  if (level === "ERROR") console.error(line);
  else console.log(line);
  try {
    await mkdir(LOG_DIR, { recursive: true });
    await appendFile(path.join(LOG_DIR, "app.log"), line + "\n", "utf8");
  } catch {}
}

export const log = {
  info: (message, meta) => write("INFO", message, meta),
  warn: (message, meta) => write("WARN", message, meta),
  error: (message, meta) => write("ERROR", message, meta),
};
