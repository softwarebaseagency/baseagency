"use client";

import { useEffect, useRef, useState } from "react";
import { useCrm } from "@/components/crm/crm-provider";

const DEFAULT_SIZE = 20;
const HOVER_SIZE = 48;
// Lerp factors – tune for feel without changing behaviour
const LERP_POS = 0.18;
const LERP_SIZE = 0.16;

/**
 * Selector for every element that should trigger the hover-expand state.
 * tr is included so table rows feel interactive.
 */
const HOVER_TARGETS = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='tab']",
  "[data-cursor]",
  "[data-dropdown-trigger]",
  "[data-brand-tab]",
  "[data-brand-card]",
  "tr",
  "nav a",
  "label"
].join(",");

export function BrandCursor() {
  const { data } = useCrm();
  const divRef = useRef<HTMLDivElement | null>(null);

  // Physics state – lives entirely in refs so the RAF loop never triggers React renders
  const posTarget = useRef({ x: -9999, y: -9999 });
  const posCurrent = useRef({ x: -9999, y: -9999 });
  const sizeTarget = useRef(DEFAULT_SIZE);
  const sizeCurrent = useRef(DEFAULT_SIZE);
  const rafId = useRef<number | null>(null);

  // Hover state
  const hoveredEl = useRef<HTMLElement | null>(null);
  // Whether the pointer is currently inside the window
  const insideWindow = useRef(false);

  const [active, setActive] = useState(false);

  useEffect(() => {
    // ── Guard: SSR / no-window
    if (typeof window === "undefined") return;

    // ── Detect environment
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isCoarsePointer =
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const shouldRun =
      data.settings.customCursor &&
      !prefersReducedMotion &&
      !isCoarsePointer &&
      !isMobile;

    setActive(shouldRun);
    document.documentElement.classList.toggle("brand-cursor-active", shouldRun);

    if (!shouldRun) return;

    // ── Helpers
    const releaseHover = () => {
      hoveredEl.current?.classList.remove("brand-cursor-target");
      hoveredEl.current = null;
      sizeTarget.current = DEFAULT_SIZE;
    };

    // ── Event handlers – all passive, never call preventDefault
    const onPointerMove = (e: PointerEvent) => {
      posTarget.current = { x: e.clientX, y: e.clientY };
      insideWindow.current = true;

      const el = e.target as HTMLElement | null;
      const hit = el?.closest(HOVER_TARGETS) as HTMLElement | null;

      if (hit !== hoveredEl.current) {
        releaseHover();
        if (hit) {
          hit.classList.add("brand-cursor-target");
          hoveredEl.current = hit;
        }
      }
      sizeTarget.current = hit ? HOVER_SIZE : DEFAULT_SIZE;
    };

    const onPointerLeave = () => {
      releaseHover();
      insideWindow.current = false;
    };

    // blur fires when the window loses focus (e.g. user tabs away)
    const onWindowBlur = () => {
      releaseHover();
      insideWindow.current = false;
    };

    // ── RAF animation loop
    const tick = () => {
      if (insideWindow.current) {
        posCurrent.current.x +=
          (posTarget.current.x - posCurrent.current.x) * LERP_POS;
        posCurrent.current.y +=
          (posTarget.current.y - posCurrent.current.y) * LERP_POS;
      }
      sizeCurrent.current +=
        (sizeTarget.current - sizeCurrent.current) * LERP_SIZE;

      const div = divRef.current;
      if (div) {
        div.style.opacity = insideWindow.current ? "0.9" : "0";
        div.style.width = `${sizeCurrent.current}px`;
        div.style.height = `${sizeCurrent.current}px`;
        div.style.transform = `translate3d(${posCurrent.current.x}px, ${posCurrent.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(tick);
    };

    // ── Attach listeners
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
    window.addEventListener("blur", onWindowBlur, { passive: true });
    rafId.current = requestAnimationFrame(tick);

    // ── Cleanup
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("blur", onWindowBlur);
      releaseHover();
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      document.documentElement.classList.remove("brand-cursor-active");
    };
  }, [data.settings.customCursor]);

  // Render nothing when inactive – avoids an invisible fixed element in the DOM
  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      // pointer-events: none is in CSS; !important ensures nothing overrides it
      className="brand-cursor"
      ref={divRef}
    />
  );
}
