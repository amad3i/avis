"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Icon from "./icons";
import ConfirmModal from "./ConfirmModal";

const CancelOrderButton = ({ orderId, token }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const doCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось отменить");
      setCancelled(true);
      toast.success("Заказ отменён");
      router.refresh();
    } catch (e) {
      toast.error(e.message);
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  if (cancelled) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <Icon name="x" className="w-7 h-7" strokeWidth={2.5} />
        </div>
        <p className="font-bold text-ink">Заказ отменён</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setConfirming(true)}
        disabled={loading}
        className="mt-6 w-full bg-red-500 text-white hover:bg-red-600 py-3.5 rounded-full font-bold transition disabled:opacity-50"
      >
        Отменить заказ
      </button>
      <ConfirmModal
        open={confirming}
        title="Отменить заказ?"
        description="Это действие необратимо. Заказ нельзя будет восстановить."
        confirmLabel="Да, отменить"
        cancelLabel="Не отменять"
        loading={loading}
        onConfirm={doCancel}
        onCancel={() => setConfirming(false)}
      />
    </>
  );
};

export default CancelOrderButton;
