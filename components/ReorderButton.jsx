"use client";
import { useCart } from "@/context/CartContext";

// Собирает переданный заказ в корзину и открывает экран оформления.
// items: [{ productId, sizeId, optionIds, quantity }]
export default function ReorderButton({ items, className }) {
  const { add, clear, setView, setOpen } = useCart();

  const handleClick = () => {
    clear();
    for (const it of items || []) {
      try {
        add(it.productId, it.sizeId, it.optionIds || [], it.quantity);
      } catch {}
    }
    setView("form");
    setOpen(true);
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      Оформить заново
    </button>
  );
}
