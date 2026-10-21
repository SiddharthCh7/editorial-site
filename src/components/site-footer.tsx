import Link from "next/link";
import { Rss } from "lucide-react";
import { navigation, site } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-rule bg-bg">
      <div className="shell-wide py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link href="/" className="font-serif text-2xl text-ink">
              {site.wordmark}
            </Link>
            <p className="mt-3 max-w-[42ch] text-sm leading-relaxed text-secondary">
              {site.tagline}
            </p>
            <p className="meta mt-5">
              Independent publication · est. {site.established}
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <h2 className="eyebrow">Sections</h2>
            <ul className="mt-4 space-y-2.5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-secondary transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="eyebrow">Follow along</h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href="/rss.xml"
                  className="inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-ink"
                >
                  <Rss aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                  RSS feed
                </a>
              </li>
              {site.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm text-secondary transition-colors hover:text-ink"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
              {site.email && (
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="text-sm text-secondary transition-colors hover:text-ink"
                  >
                    Email
                  </a>
                </li>
              )}
            </ul>
            {site.socials.length === 0 && !site.email && (
              <p className="mt-4 max-w-[26ch] text-xs leading-relaxed text-muted">
                No external profiles are listed yet. The RSS feed is the most
                reliable way to keep up.
              </p>
            )}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-rule pt-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}</p>
          <p className="font-mono text-[0.6875rem] tracking-[0.04em]">
            Set in Newsreader, Inter and JetBrains Mono.
          </p>
        </div>
      </div>
    </footer>
  );
}
