"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/lib/site";

export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
      {navigation.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-1 text-[0.8125rem] tracking-[0.01em] transition-colors ${
              active ? "text-ink" : "text-secondary hover:text-ink"
            }`}
          >
            {item.label}
            <span
              aria-hidden="true"
              className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-200 ${
                active ? "w-full opacity-100" : "w-0 opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
