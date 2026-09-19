"use client";

import { useSyncExternalStore } from "react";
import { CloudShader } from "@/components/ui/cloud-shader";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.getAttribute("data-theme") === "dark";
}

function getServerSnapshot() {
  return false;
}

export default function HeroCloudBackground({ className }: { className?: string }) {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <CloudShader
      className={className}
      cloudColor={isDark ? "#c9d3e6" : "#fbf8f2"}
      // Kept off pure/near-black on purpose: the hero is tall enough now
      // (it stretches down past the floating dashboard preview) that a
      // near-black top color reads as a solid black band once the vertical
      // gradient is stretched over that height, rather than "night sky".
      skyTopColor={isDark ? "#182449" : "#3876ba"}
      skyBottomColor={isDark ? "#2c3d68" : "#8cbfe8"}
    />
  );
}
