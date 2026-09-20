import { db } from "@/lib/db";
import { subscribe } from "@/lib/pubsub";

export const dynamic = "force-dynamic";

const BOARD_STATUSES = ["new", "cooking", "ready", "canceled"];

async function boardSignature() {
  const rows = await db.order.findMany({
    where: { status: { in: BOARD_STATUSES } },
    select: { id: true, status: true, updatedAt: true },
    orderBy: { id: "desc" },
    take: 100,
  });
  return rows.map((r) => `${r.id}:${r.status}:${r.updatedAt.getTime()}`).join("|");
}

export async function GET(req) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let lastSig = null;
      let pollTimer = null;
      let stopped = false;

      const send = (event) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {}
      };

      send({ type: "connected" });

      const unsub = subscribe(send);

      const poll = async () => {
        if (stopped) return;
        try {
          const sig = await boardSignature();
          if (sig !== lastSig) {
            lastSig = sig;
            send({ type: "orders" });
          }
        } catch {}
      };

      poll();
      pollTimer = setInterval(poll, 1200);

      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {}
      }, 25000);

      const cleanup = () => {
        if (closed) return;
        closed = true;
        stopped = true;
        clearInterval(ping);
        clearInterval(pollTimer);
        unsub();
        try {
          controller.close();
        } catch {}
      };
      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
