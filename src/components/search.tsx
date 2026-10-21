"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search as SearchIcon, X } from "lucide-react";
import type { SearchRecord } from "@/lib/types";

type Props = {
  records: SearchRecord[];
};

function scoreRecord(record: SearchRecord, tokens: string[]): number {
  const title = record.title.toLowerCase();
  const description = record.description.toLowerCase();
  const tags = record.tags.join(" ").toLowerCase();

  let score = 0;
  for (const token of tokens) {
    const inTitle = title.includes(token);
    const inTags = tags.includes(token);
    const inDescription = description.includes(token);
    if (!inTitle && !inTags && !inDescription) return 0;
    if (inTitle) score += 10;
    if (inTags) score += 5;
    if (inDescription) score += 2;
    if (title.startsWith(token)) score += 6;
  }
  return score;
}

const TYPE_LABEL: Record<SearchRecord["type"], string> = {
  article: "Writing",
  project: "Project",
};

export function Search({ records }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return records.slice(0, 6);
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    return records
      .map((record) => ({ record, score: scoreRecord(record, tokens) }))
      .filter((entry) => entry.score > 0)
      // Writing leads on a tie; a project is usually the deeper follow-up.
      .sort(
        (a, b) =>
          b.score - a.score ||
          (a.record.type === "article" ? 0 : 1) - (b.record.type === "article" ? 0 : 1),
      )
      .slice(0, 8)
      .map((entry) => entry.record);
  }, [query, records]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    triggerRef.current?.focus();
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setActive(0);
      router.push(href);
    },
    [router],
  );

  // Global shortcut: Cmd/Ctrl+K, or "/" when not typing in a field.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (!typing && event.key === "/") {
        event.preventDefault();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.dataset.scrollLocked = "true";
    inputRef.current?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    }
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.body.dataset.scrollLocked;
      if (previous && document.contains(previous)) previous.focus();
    };
  }, [open, close]);

  // Keep the highlighted result in view during keyboard navigation.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((value) => (results.length ? (value + 1) % results.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((value) =>
        results.length ? (value - 1 + results.length) % results.length : 0,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = results[active];
      if (target) go(target.href);
    } else if (event.key === "Tab") {
      // Keep focus inside the dialog: one input, one close button.
      const focusables = [inputRef.current, document.getElementById("search-close")];
      const index = focusables.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      const next = event.shiftKey ? index - 1 : index + 1;
      focusables[(next + focusables.length) % focusables.length]?.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Control+K Meta+K"
        className="group inline-flex h-9 items-center gap-2 border border-rule px-2.5 text-secondary transition-colors hover:border-rule-strong hover:text-ink"
      >
        <SearchIcon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="sr-only sm:hidden">Search</span>
        <span className="hidden text-xs tracking-wide sm:inline">Search</span>
        <kbd
          aria-hidden="true"
          className="ml-1 hidden border border-rule px-1 font-mono text-[0.625rem] leading-4 text-muted md:inline"
        >
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh]">
          <div
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 bg-[color-mix(in_oklab,var(--ink)_30%,transparent)] backdrop-blur-[2px]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search writing and projects"
            className="relative z-10 w-full max-w-[38rem] border border-rule-strong bg-surface shadow-[0_24px_60px_-30px_rgba(20,25,22,0.45)]"
          >
            <div className="flex items-center gap-3 border-b border-rule px-4">
              <SearchIcon
                aria-hidden="true"
                className="h-4 w-4 shrink-0 text-muted"
                strokeWidth={1.5}
              />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="search-results"
                aria-autocomplete="list"
                aria-activedescendant={
                  results.length ? `search-result-${Math.min(active, results.length - 1)}` : undefined
                }
                aria-label="Search writing and projects"
                placeholder="Search titles, topics, summaries…"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
                onKeyDown={onInputKeyDown}
                autoComplete="off"
                spellCheck={false}
                className="h-14 w-full bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-muted"
              />
              <button
                id="search-close"
                type="button"
                onClick={close}
                aria-label="Close search"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center border border-rule text-secondary transition-colors hover:border-rule-strong hover:text-ink"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="max-h-[52vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-ink">No matches for “{query.trim()}”.</p>
                  <p className="mt-1 text-xs text-secondary">
                    Try a broader term, or browse the{" "}
                    <Link className="link" href="/writing" onClick={close}>
                      full archive
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <ul ref={listRef} id="search-results" role="listbox" aria-label="Results">
                  {results.map((record, index) => (
                    <li key={record.href} role="none">
                      <a
                        id={`search-result-${index}`}
                        data-index={index}
                        role="option"
                        aria-selected={index === active}
                        href={record.href}
                        onMouseEnter={() => setActive(index)}
                        onClick={(event) => {
                          event.preventDefault();
                          go(record.href);
                        }}
                        className={`flex items-baseline gap-3 border-b border-rule/70 px-4 py-3 last:border-b-0 ${
                          index === active ? "bg-bg" : ""
                        }`}
                      >
                        <span
                          className={`font-mono text-[0.625rem] uppercase tracking-widest ${
                            index === active ? "text-accent" : "text-muted"
                          }`}
                        >
                          {TYPE_LABEL[record.type]}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-serif text-[1.02rem] leading-snug text-ink">
                            {record.title}
                          </span>
                          <span className="mt-0.5 block truncate text-xs text-secondary">
                            {record.description}
                          </span>
                        </span>
                        {index === active && (
                          <CornerDownLeft
                            aria-hidden="true"
                            className="h-3.5 w-3.5 shrink-0 text-accent"
                            strokeWidth={1.5}
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-rule px-4 py-2">
              <span className="font-mono text-[0.625rem] uppercase tracking-widest text-muted">
                {query.trim()
                  ? `${results.length} result${results.length === 1 ? "" : "s"}`
                  : "Recent & suggested"}
              </span>
              <span className="hidden font-mono text-[0.625rem] uppercase tracking-widest text-muted sm:block">
                ↑↓ navigate · ↵ open · esc close
              </span>
            </div>
            <p aria-live="polite" className="sr-only">
              {results.length} results available
            </p>
          </div>
        </div>
      )}
    </>
  );
}
