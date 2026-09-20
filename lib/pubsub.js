import { EventEmitter } from "events";

const g = globalThis;
if (!g.__adminPubSub) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);
  g.__adminPubSub = emitter;
}

const emitter = g.__adminPubSub;

export function publish(event) {
  emitter.emit("change", event);
}

export function subscribe(handler) {
  emitter.on("change", handler);
  return () => emitter.off("change", handler);
}
