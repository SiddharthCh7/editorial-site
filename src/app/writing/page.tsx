import type { Metadata } from "next";
import Link from "next/link";
import { WritingArchive, type ArchiveItem } from "@/components/writing-archive";
import { getAllArticles, getAllTopics } from "@/lib/content";
import { formatMonthYear } from "@/lib/format";
import { site, socialImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Long-form essays, deep dives and working notes on LLM inference, AI agents, and systems engineering. Browse chronologically or by topic.",
  alternates: { canonical: "/writing" },
  openGraph: {
    images: [socialImage],
    title: `Writing - ${site.name}`,
    description:
      "Long-form essays, deep dives and working notes on LLM inference, AI agents, and systems engineering.",
    url: "/writing",
  },
};

export default function WritingPage() {
  const articles = getAllArticles();
  const topics = getAllTopics().filter((topic) => topic.articleCount > 0);

  const items: ArchiveItem[] = articles.map((article) => ({
    slug: article.slug,
    title: article.title,
    description: article.description,
    tags: article.tags,
    publishedAt: article.publishedAt,
    readingTime: article.readingTime,
    draft: article.draft,
  }));

  const latest = articles[0];
  const totalWords = articles.reduce((sum, article) => sum + article.wordCount, 0);

  return (
    <div className="shell-wide pt-12 pb-8 sm:pt-16">
      <header className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
            <span className="eyebrow">The archive</span>
          </p>
          <h1 className="mt-6 max-w-[24ch] font-serif text-[clamp(2.4rem,1.8rem+2.6vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            Writing, in the order it was worked out.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[1rem] leading-relaxed text-secondary">
            Essays and notebooks on inference, agents, and the engineering
            underneath them. Some pieces are tutorials, some are post-mortems,
            some are arguments I am still testing. Everything is editable, so
            corrections are expected.
          </p>
        </div>

        <div className="lg:col-span-4 lg:pt-14">
          <dl className="grid grid-cols-2 gap-y-4 border-t border-rule pt-4 text-sm">
            <div>
              <dt className="eyebrow">Pieces</dt>
              <dd className="mt-1 font-mono text-ink">
                {String(articles.length).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Approx. words</dt>
              <dd className="mt-1 font-mono text-ink">
                {totalWords.toLocaleString("en-GB")}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Most recent</dt>
              <dd className="mt-1 font-mono text-ink">
                {latest ? formatMonthYear(latest.publishedAt) : "-"}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Feed</dt>
              <dd className="mt-1 font-mono text-ink">
                <Link href="/rss.xml" className="link-accent">
                  RSS
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <WritingArchive
        items={items}
        topics={topics.map((topic) => ({
          slug: topic.slug,
          name: topic.name,
          count: topic.articleCount,
        }))}
      />
    </div>
  );
}
