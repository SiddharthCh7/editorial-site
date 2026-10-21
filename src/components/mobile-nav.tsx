"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { navigation } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close when the route changes, including via browser back/forward. This is
  // the documented "adjust state during render" pattern rather than an effect.
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    document.body.dataset.scrollLocked = "true";

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.body.dataset.scrollLocked;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 items-center justify-center border border-transparent text-secondary transition-colors hover:border-rule hover:text-ink"
      >
        {open ? (
          <X aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        ) : (
          <Menu aria-hidden="true" className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>

      <div
        id="mobile-navigation"
        ref={panelRef}
        hidden={!open}
        className="fixed inset-x-0 top-[var(--header-height)] z-40 max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-b border-rule bg-bg pb-8"
      >
        <nav aria-label="Mobile" className="shell-wide pt-4">
          <ul className="divide-y divide-rule">
            {navigation.map((item, index) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className="flex items-baseline justify-between py-4"
                  >
                    <span className="font-serif text-2xl">
                      <span
                        className={active ? "text-accent" : "text-ink"}
                      >
                        {item.label}
                      </span>
                    </span>
                    <span className="font-mono text-[0.625rem] uppercase tracking-widest text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 max-w-[36ch] text-sm leading-relaxed text-secondary">
            Independent engineering notes on LLM inference, agents, and the
            systems that hold them together.
          </p>
        </nav>
      </div>
    </div>
  );
}
