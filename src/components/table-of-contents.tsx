"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Heading } from "@/lib/markdown";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const offset = 140;
      let current = headings[0].id;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - offset <= 0) {
          current = heading.id;
        }
      }
      setActiveId(current);
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
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <>
      {/* Desktop: sticky column that indicates the current section */}
      <nav aria-label="On this page" className="hidden xl:block">
        <div className="sticky top-[calc(var(--header-height)+2rem)] max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2">
          <p className="eyebrow border-b border-rule pb-2">On this page</p>
          <ol className="mt-3 space-y-0.5">
            {headings.map((heading) => {
              const active = heading.id === activeId;
              return (
                <li key={heading.id}>
                  <a
                    href={`#${heading.id}`}
                    aria-current={active ? "location" : undefined}
                    className={`-ml-px flex gap-2 border-l py-1.5 pl-3 text-[0.8125rem] leading-snug transition-colors ${
                      active
                        ? "border-accent text-ink"
                        : "border-rule text-secondary hover:border-rule-strong hover:text-ink"
                    } ${heading.level === 3 ? "pl-6 text-[0.78rem]" : ""}`}
                  >
                    <span className="sr-only">Section: </span>
                    {heading.text}
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Mobile: collapsed contents control */}
      <details className="group border-y border-rule py-1 xl:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-2.5 text-[0.8125rem] text-ink [&::-webkit-details-marker]:hidden">
          <span className="eyebrow">Contents</span>
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
            strokeWidth={1.5}
          />
        </summary>
        <ol className="pb-4">
          {headings.map((heading) => (
            <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
              <a
                href={`#${heading.id}`}
                className="block py-1.5 text-sm text-secondary hover:text-ink"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
