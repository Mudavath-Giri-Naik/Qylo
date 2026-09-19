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
      skyTopColor={isDark ? "#0a1024" : "#3876ba"}
      skyBottomColor={isDark ? "#233258" : "#8cbfe8"}
    />
  );
}
