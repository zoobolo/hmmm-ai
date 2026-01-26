"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function ScrollToTop() {
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    // Immediate scroll reset with instant behavior
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    // Reset again after Framer Motion animations start (50ms)
    const timeout1 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }, 50);

    // And once more after animations likely complete (150ms)
    const timeout2 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }, 150);

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [pathname]);

  return null;
}
