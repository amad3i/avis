"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ScrollManager = () => {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length > 1) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollManager;
