import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { PrimaryNav } from "./nav-links";
import { Search } from "./search";
import { ThemeToggle } from "./theme-toggle";
import { getSearchIndex } from "@/lib/content";
import { site } from "@/lib/site";

export function SiteHeader() {
  const records = getSearchIndex();

  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-bg">
      <div className="shell-wide flex h-[var(--header-height)] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-baseline gap-2.5 py-2">
          <span className="font-serif text-[1.0625rem] leading-none tracking-[-0.01em] text-ink">
            {site.wordmark}
          </span>
          <span className="hidden font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted sm:inline">
            {site.descriptor}
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <PrimaryNav />
          <span aria-hidden="true" className="mx-2 hidden h-4 w-px bg-rule lg:block" />
          <Search records={records} />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
