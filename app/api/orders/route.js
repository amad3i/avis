import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireRole } from "@/lib/auth";
import { validateOrderInput, createOrder, OrderValidationError } from "@/lib/orders";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { log } from "@/lib/log";
import { getOrders } from "@/lib/data";
import { publish } from "@/lib/pubsub";

// Идемпотентность: один и тот же ключ отдаёт уже созданный заказ.
// Защищает от случайных двойных отправок и ретраев при сбоях сети/сервера,
// но не мешает намеренному повтору или параллельным заказам (у них новый ключ).
const idemMap = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [key, v] of idemMap) {
    if (now - v.ts > 10 * 60 * 1000) idemMap.delete(key);
  }
}, 60 * 1000).unref();

export async function POST(req) {
  const ip = clientIp(req);
  const rl = rateLimit(`order:${ip}`, 5, 60000);
  if (!rl.ok) {
    log.warn("Order rate limited", { ip });
    return NextResponse.json(
      { success: false, error: "Слишком много заказов. Попробуйте через минуту." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await req.json();

    if (body.trap) {
      log.warn("Order honeypot triggered", { ip });
      return NextResponse.json({ success: false, error: "Отклонено" }, { status: 400 });
    }

    const { value, error } = validateOrderInput(body);
    if (error) {
      return NextResponse.json({ success: false, error }, { status: 400 });
    }

    const idemKey = typeof body.idempotencyKey === "string" ? body.idempotencyKey : null;
    if (idemKey) {
      const hit = idemMap.get(`${ip}:${idemKey}`);
      if (hit && Date.now() - hit.ts < 10 * 60 * 1000) {
        log.info("Order idempotent replay", { ip, idemKey });
        return NextResponse.json(hit.result);
      }
    }

    const order = await createOrder(value, ip);
    const result = { success: true, number: order.id, token: order.cancelToken, total: order.total };
    if (idemKey) idemMap.set(`${ip}:${idemKey}`, { ts: Date.now(), result });

    publish({ type: "orders" });
    revalidateTag("orders");
    revalidateTag("analytics");
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof OrderValidationError) {
      return NextResponse.json({ success: false, error: e.message }, { status: 400 });
    }
    log.error("Order creation failed", { error: e.message });
    return NextResponse.json(
      { success: false, error: "Не удалось создать заказ. Позвоните нам - оформим по телефону." },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  const session = await requireRole("admin", "kitchen");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const board = searchParams.get("board");
  const key = board ? "board" : status || "all";

  const orders = await getOrders(key);

  return NextResponse.json({ success: true, orders });
}
