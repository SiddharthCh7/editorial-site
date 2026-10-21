"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search as SearchIcon, X } from "lucide-react";
import { formatDate } from "@/lib/format";
import { slugifyTopic, topicName } from "@/lib/topics";

export type ArchiveItem = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  readingTime: string;
  draft: boolean;
};

const PAGE_SIZE = 10;

type Props = {
  items: ArchiveItem[];
  topics: { slug: string; name: string; count: number }[];
};

export function WritingArchive({ items, topics }: Props) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string | null>(null);
  const [order, setOrder] = useState<"newest" | "oldest">("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = items.filter((item) => {
      if (topic && !item.tags.some((tag) => slugifyTopic(tag) === topic)) return false;
      if (tokens.length === 0) return true;
      const haystack = `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });

    return [...matches].sort((a, b) =>
      order === "newest"
        ? b.publishedAt.localeCompare(a.publishedAt)
        : a.publishedAt.localeCompare(b.publishedAt),
    );
  }, [items, order, query, topic]);

  const shown = filtered.slice(0, visible);
  const hasFilters = query.trim().length > 0 || topic !== null;

  function reset() {
    setQuery("");
    setTopic(null);
    setVisible(PAGE_SIZE);
  }

  return (
    <div>
      {/* Controls ---------------------------------------------------------- */}
      <div className="mt-10 border-y border-rule py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-[20rem]">
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
              strokeWidth={1.5}
            />
            <label htmlFor="archive-search" className="sr-only">
              Search the archive
            </label>
            <input
              id="archive-search"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setVisible(PAGE_SIZE);
              }}
              placeholder="Search titles, topics, summaries…"
              className="h-9 w-full border-b border-rule bg-transparent pl-6 pr-6 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-ink"
              >
                <X aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">
              {String(filtered.length).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1" role="group" aria-label="Sort order">
              {(
                [
                  ["newest", "Newest"],
                  ["oldest", "Oldest"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOrder(value)}
                  aria-pressed={order === value}
                  className={`border px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.08em] transition-colors ${
                    order === value
                      ? "border-ink bg-ink text-bg"
                      : "border-rule text-secondary hover:border-rule-strong hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {topics.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Topics</span>
            <button
              type="button"
              onClick={() => {
                setTopic(null);
                setVisible(PAGE_SIZE);
              }}
              aria-pressed={topic === null}
              className={`tag ${topic === null ? "tag-active" : ""}`}
            >
              All
            </button>
            {topics.map((entry) => (
              <button
                key={entry.slug}
                type="button"
                onClick={() => {
                  setTopic(topic === entry.slug ? null : entry.slug);
                  setVisible(PAGE_SIZE);
                }}
                aria-pressed={topic === entry.slug}
                className={`tag ${topic === entry.slug ? "tag-active" : ""}`}
              >
                {entry.name}
                <span className="ml-1.5 text-[0.5625rem] opacity-60">{entry.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results ----------------------------------------------------------- */}
      <p aria-live="polite" className="sr-only">
        {filtered.length} articles match the current filters.
      </p>

      {filtered.length === 0 ? (
        <div className="border-b border-rule py-16 text-center">
          <p className="font-serif text-2xl">Nothing matches that.</p>
          <p className="mx-auto mt-2 max-w-[40ch] text-sm leading-relaxed text-secondary">
            No piece in the archive matches
            {query.trim() ? ` “${query.trim()}”` : ""}
            {topic ? ` under ${topicName(topic)}` : ""}. Try a broader search or clear
            the filters.
          </p>
          <button type="button" onClick={reset} className="btn mt-6">
            Clear filters
          </button>
        </div>
      ) : (
        <ol>
          {shown.map((item) => (
            <li key={item.slug} className="border-b border-rule">
              <article className="group grid gap-3 py-7 sm:grid-cols-12 sm:gap-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:col-span-3 sm:flex-col sm:gap-1.5">
                  <Link
                    href={`/topics/${slugifyTopic(item.tags[0])}`}
                    className="eyebrow transition-colors hover:text-accent"
                  >
                    {topicName(slugifyTopic(item.tags[0]))}
                  </Link>
                  <span className="meta">{formatDate(item.publishedAt)}</span>
                  <span className="meta">{item.readingTime}</span>
                </div>
                <div className="sm:col-span-9">
                  <h2 className="font-serif text-[1.375rem] leading-snug tracking-[-0.012em]">
                    <Link
                      href={`/writing/${item.slug}`}
                      className="transition-colors hover:text-accent-strong"
                    >
                      {item.title}
                    </Link>
                    {item.draft && (
                      <span className="ml-2 align-middle font-mono text-[0.5625rem] uppercase tracking-widest text-accent">
                        draft
                      </span>
                    )}
                  </h2>
                  <p className="mt-2 max-w-[66ch] text-[0.9rem] leading-relaxed text-secondary">
                    {item.description}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {item.tags.slice(1).map((tag) => (
                      <Link
                        key={tag}
                        href={`/topics/${slugifyTopic(tag)}`}
                        className="tag"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ol>
      )}

      {filtered.length > shown.length && (
        <div className="flex justify-center pt-8">
          <button
            type="button"
            onClick={() => setVisible((value) => value + PAGE_SIZE)}
            className="btn"
          >
            Load {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
            <span aria-hidden="true">↓</span>
          </button>
        </div>
      )}

      {!hasFilters && filtered.length > 0 && (
        <p className="mt-8 text-center">
          <Link
            href="/topics"
            className="group inline-flex items-center gap-1.5 text-[0.8125rem] text-secondary transition-colors hover:text-ink"
          >
            Browse by topic instead
            <ArrowRight aria-hidden="true" className="arrow h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </p>
      )}
    </div>
  );
}
