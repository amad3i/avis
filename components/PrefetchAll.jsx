"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrefetchAll({ productIds = [] }) {
  const router = useRouter();
  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/all-products");
    for (const id of productIds) router.prefetch(`/product/${id}`);
  }, [router, productIds]);
  return null;
}
