"use client";

import { useEffect, useRef, useState } from "react";
import { OptionWheel, type OptionWheelItem } from "@/components/ui/option-wheel";
import { useReducedMotion } from "@/lib/cojeev-motion/use-reduced-motion";
import { MODULES, moduleTitle } from "@/lib/learn/modules";

const ROTATE_MS = 4000;

const ITEMS: OptionWheelItem[] = MODULES.map((m) => ({
  id: m.code,
  label: moduleTitle(m, "en"),
  description: m.description.en ?? moduleTitle(m, "en"),
}));

export function AuthOptionWheel() {
  const [selected, setSelected] = useState(0);
  const reducedMotion = useReducedMotion();
  const pausedUntil = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setSelected((prev) => (prev + 1) % ITEMS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  return (
    <div className="flex h-full flex-col justify-center gap-4 p-8">
      <div>
        <p className="text-sm font-semibold text-[var(--accent)]">What you&apos;ll learn</p>
        <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">Four modules, one journey</h2>
      </div>
      <OptionWheel
        items={ITEMS}
        selectedIndex={selected}
        onSelectionChange={(index) => {
          // A manual pick pauses auto-rotation briefly so the choice doesn't
          // get yanked away mid-read.
          pausedUntil.current = Date.now() + ROTATE_MS * 2;
          setSelected(index);
        }}
        aria-label="Qylo learning modules"
      />
    </div>
  );
}
