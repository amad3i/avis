import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { setOrderStatus, OrderStateConflictError, CANCEL_GRACE_MS } from "@/lib/orders";
import { sanitizeToken } from "@/lib/sanitize";
import { publish } from "@/lib/pubsub";

export async function POST(req, { params }) {
  const { id } = await params;

  let token;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ success: false, error: "Некорректный запрос" }, { status: 400 });
  }

  token = sanitizeToken(token);

  const order = await db.order.findUnique({ where: { id: Number(id) } });
  if (!order || order.cancelToken !== token) {
    return NextResponse.json({ success: false, error: "Нет доступа" }, { status: 401 });
  }

  if (order.status !== "new" && order.status !== "cooking" && order.status !== "ready") {
    return NextResponse.json(
      { success: false, error: "Заказ уже нельзя отменить" },
      { status: 409 }
    );
  }

  // Грейс-окно: отмена ещё возможна, пока повар не выдал заказ (не older CANCEL_GRACE_MS)
  if (order.status === "cooking" || order.status === "ready") {
    const elapsed = Date.now() - new Date(order.updatedAt).getTime();
    if (elapsed > CANCEL_GRACE_MS) {
      return NextResponse.json(
        { success: false, error: "Заказ уже готовится — отмена недоступна" },
        { status: 409 }
      );
    }
  }

  try {
    await setOrderStatus(Number(id), "canceled", { canceledBy: "user" }, ["new", "cooking", "ready"]);
  } catch (e) {
    if (e instanceof OrderStateConflictError) {
      const cur = await db.order.findUnique({ where: { id: Number(id) } });
      if (cur && cur.status === "canceled" && cur.canceledBy === "user") {
        revalidateTag("orders");
        revalidateTag("analytics");
        publish({ type: "orders" });
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { success: false, error: "Заказ уже готовится или выдан — отмена недоступна" },
        { status: 409 }
      );
    }
    throw e;
  }

  revalidateTag("orders");
  revalidateTag("analytics");
  publish({ type: "orders" });
  return NextResponse.json({ success: true });
}
