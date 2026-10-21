import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Article } from "@/lib/content";
import { slugifyTopic } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { topicName } from "@/lib/content";

function PrimaryTopic({ article }: { article: Article }) {
  const tag = article.tags[0];
  const slug = slugifyTopic(tag);
  return (
    <Link
      href={`/topics/${slug}`}
      className="eyebrow transition-colors hover:text-accent"
    >
      {topicName(slug)}
    </Link>
  );
}

export function ArticleLead({ article }: { article: Article }) {
  return (
    <article className="group relative grid gap-6 border-t border-rule pt-7 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <PrimaryTopic article={article} />
          <span aria-hidden="true" className="text-rule-strong">
            /
          </span>
          <span className="meta">{formatDate(article.publishedAt)}</span>
        </div>
        {article.draft && (
          <span className="mt-2 inline-block border border-accent/40 px-1.5 py-0.5 font-mono text-[0.625rem] uppercase tracking-widest text-accent">
            Draft
          </span>
        )}
      </div>

      <div className="md:col-span-8">
        <h3 className="font-serif text-[1.75rem] leading-[1.15] tracking-[-0.015em] md:text-[2rem]">
          <Link href={`/writing/${article.slug}`} className="transition-colors hover:text-accent-strong">
            {article.title}
          </Link>
        </h3>
        <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-secondary">
          {article.description}
        </p>
        <div className="mt-4 flex items-center gap-4">
          <span className="meta">{article.readingTime}</span>
          <Link
            href={`/writing/${article.slug}`}
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink transition-colors hover:text-accent-strong"
          >
            Read
            <ArrowRight aria-hidden="true" className="arrow h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ArticleRow({ article }: { article: Article }) {
  return (
    <article className="group grid gap-3 border-t border-rule py-6 sm:grid-cols-12 sm:gap-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:col-span-3 sm:flex-col sm:gap-1.5">
        <PrimaryTopic article={article} />
        <span className="meta">{formatDate(article.publishedAt)}</span>
        <span className="meta">{article.readingTime}</span>
      </div>

      <div className="sm:col-span-9">
        <h3 className="font-serif text-[1.3125rem] leading-snug tracking-[-0.01em]">
          <Link
            href={`/writing/${article.slug}`}
            className="transition-colors hover:text-accent-strong"
          >
            {article.title}
          </Link>
          {article.draft && (
            <span className="ml-2 align-middle font-mono text-[0.5625rem] uppercase tracking-widest text-accent">
              draft
            </span>
          )}
        </h3>
        <p className="mt-1.5 max-w-[64ch] text-[0.9rem] leading-relaxed text-secondary">
          {article.description}
        </p>
      </div>
    </article>
  );
}

export function ArticleCompact({ article }: { article: Article }) {
  return (
    <article className="border-t border-rule pt-4">
      <PrimaryTopic article={article} />
      <h3 className="mt-2 font-serif text-[1.15rem] leading-snug">
        <Link href={`/writing/${article.slug}`} className="transition-colors hover:text-accent-strong">
          {article.title}
        </Link>
      </h3>
      <p className="mt-1.5 text-[0.85rem] leading-relaxed text-secondary">
        {article.description}
      </p>
      <p className="meta mt-3">
        {formatDate(article.publishedAt)} · {article.readingTime}
      </p>
    </article>
  );
}
