"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/** Drives site-wide inertia scrolling via Lenis. Skipped on the Circuit
 * Builder, which owns its own no-scroll viewport and canvas wheel handling
 * that Lenis's global wheel hijacking would otherwise fight with. */
export default function SmoothScroll() {
  const pathname = usePathname();
  const disabled = pathname === "/circuit-builder";

  useEffect(() => {
    if (disabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, [disabled, pathname]);

  return null;
}
