import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { setOrderStatus, OrderStateConflictError } from "@/lib/orders";
import { requireRole } from "@/lib/auth";
import { publish } from "@/lib/pubsub";

const STATUSES = ["new", "cooking", "ready", "done", "canceled"];
const ACTIVE = ["new", "cooking", "ready"];

const FROM = {
  cooking: "new",
  ready: "cooking",
  done: "ready",
  canceled: ACTIVE,
};

export async function PATCH(req, { params }) {
  const session = await requireRole("admin", "kitchen");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const status = body.status;

  if (!STATUSES.includes(status)) {
    return NextResponse.json({ success: false, error: "bad status" }, { status: 400 });
  }

  const current = await db.order.findUnique({ where: { id: Number(id) } });
  if (!current) return NextResponse.json({ success: false, error: "Заказ не найден" }, { status: 404 });

  // Возврат из «Отменён» туда, откуда взяли (только для отмены поваром)
  const isResume = current.status === "canceled" && status !== "canceled";
  if (isResume) {
    if (current.canceledBy === "user") {
      return NextResponse.json(
        { success: false, error: "Заказ отменён клиентом" },
        { status: 409 }
      );
    }
    if (!ACTIVE.includes(status)) {
      return NextResponse.json({ success: false, error: "bad status" }, { status: 400 });
    }
    try {
      const order = await setOrderStatus(
        Number(id),
        status,
        { canceledBy: null, prevStatus: null },
        "canceled"
      );
      publish({ type: "orders" });
      revalidateTag("orders");
      revalidateTag("analytics");
      return NextResponse.json({ success: true, order });
    } catch (e) {
      if (e instanceof OrderStateConflictError) {
        const cur = await db.order.findUnique({ where: { id: Number(id) } });
        const msg =
          cur?.canceledBy === "user"
            ? "Клиент уже отменил этот заказ"
            : "Заказ уже изменён — обновите доску";
        return NextResponse.json({ success: false, error: msg }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: "Заказ не найден" }, { status: 404 });
    }
  }

  if (status === "new") {
    return NextResponse.json({ success: false, error: "bad status" }, { status: 400 });
  }

  const extra = { canceledBy: status === "canceled" ? body.canceledBy || "kitchen" : null };
  // Запоминаем, из какого столбца взяли заказ, чтобы повар мог вернуть его туда же
  if (status === "canceled") {
    extra.prevStatus = current.status;
  }
  const from = FROM[status];

  try {
    const order = await setOrderStatus(Number(id), status, extra, from);
    publish({ type: "orders" });
    revalidateTag("orders");
    revalidateTag("analytics");
    return NextResponse.json({ success: true, order });
  } catch (e) {
    if (e instanceof OrderStateConflictError) {
      const cur = await db.order.findUnique({ where: { id: Number(id) } });
      const msg =
        cur?.canceledBy === "user"
          ? "Заказ отменён клиентом"
          : "Заказ уже изменён — обновите доску";
      return NextResponse.json({ success: false, error: msg }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Заказ не найден" }, { status: 404 });
  }
}

export async function DELETE(req, { params }) {
  const session = await requireRole("admin");
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.order.delete({ where: { id: Number(id) } });
  publish({ type: "orders" });
  revalidateTag("orders");
  revalidateTag("analytics");
  return NextResponse.json({ success: true });
}
