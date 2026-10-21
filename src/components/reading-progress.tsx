"use client";

import { useEffect, useState } from "react";

/**
 * A two-pixel progress line under the header. It reads scroll position, writes
 * only a CSS custom property, and never intercepts pointer events.
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      setProgress(value);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-x-0 top-[var(--header-height)] z-40 h-[2px] bg-transparent print:hidden"
    >
      <div
        className="h-full origin-left bg-accent/80"
        style={{ transform: `scaleX(${progress})`, transition: "transform 80ms linear" }}
      />
    </div>
  );
}
