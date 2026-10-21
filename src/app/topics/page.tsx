import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getAllTopics } from "@/lib/content";
import { site, socialImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Topics",
  description:
    "An index of the threads running through this site: inference, agents, systems, optimisation, and the vocabulary that connects them.",
  alternates: { canonical: "/topics" },
  openGraph: {
    images: [socialImage],
    title: `Topics - ${site.name}`,
    description:
      "An index of the threads running through this site: inference, agents, systems, optimisation, and notation.",
    url: "/topics",
  },
};

export default function TopicsPage() {
  const topics = getAllTopics().filter((topic) => topic.articleCount > 0);
  const totalArticles = topics.reduce((sum, topic) => sum + topic.articleCount, 0);

  return (
    <div className="shell-wide pt-12 pb-10 sm:pt-16">
      <header className="max-w-[62ch]">
        <p className="flex items-center gap-3">
          <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
          <span className="eyebrow">Topic index</span>
        </p>
        <h1 className="mt-6 font-serif text-[clamp(2.4rem,1.8rem+2.6vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
          An atlas, not a taxonomy.
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-secondary">
          Topics are generated from the metadata of what has actually been
          published, so nothing here is an empty shelf. Follow a thread and the
          pieces accumulate into an argument rather than a list; several are
          meant to be read in sequence.
        </p>
        <p className="meta mt-6">
          {topics.length} threads · {totalArticles} filed articles
        </p>
      </header>

      <ul className="mt-14">
        {topics.map((topic, index) => (
          <li key={topic.slug} className="border-t border-rule last:border-b">
            <div className="grid gap-4 py-8 lg:grid-cols-12 lg:gap-8">
              <div className="flex items-baseline gap-4 lg:col-span-2">
                <span className="font-mono text-[0.6875rem] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="meta lg:hidden">
                  {topic.articleCount} {topic.articleCount === 1 ? "piece" : "pieces"}
                </span>
              </div>

              <div className="lg:col-span-6">
                <h2 className="font-serif text-[1.65rem] leading-tight tracking-[-0.015em]">
                  <Link
                    href={`/topics/${topic.slug}`}
                    className="transition-colors hover:text-accent-strong"
                  >
                    {topic.name}
                  </Link>
                </h2>
                <p className="mt-2 max-w-[58ch] text-[0.9rem] leading-relaxed text-secondary">
                  {topic.description}
                </p>
                {topic.latest && (
                  <p className="mt-4 flex flex-wrap items-baseline gap-2 text-[0.8125rem] text-secondary">
                    <span className="eyebrow">Latest</span>
                    <Link
                      href={`/writing/${topic.latest.slug}`}
                      className="link max-w-[44ch]"
                    >
                      {topic.latest.title}
                    </Link>
                  </p>
                )}
              </div>

              <div className="flex items-start justify-between gap-4 lg:col-span-4 lg:justify-end">
                <span className="hidden lg:block lg:pr-8 lg:pt-1">
                  <span className="meta block">
                    {topic.articleCount} {topic.articleCount === 1 ? "piece" : "pieces"}
                  </span>
                  {topic.projectCount > 0 && (
                    <span className="meta mt-1 block">
                      {topic.projectCount} project{topic.projectCount === 1 ? "" : "s"}
                    </span>
                  )}
                </span>
                <Link
                  href={`/topics/${topic.slug}`}
                  aria-label={`Browse ${topic.name}`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-rule text-accent transition-colors hover:border-accent"
                >
                  <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-10 max-w-[52ch] text-sm leading-relaxed text-secondary">
        Prefer chronology? The{" "}
        <Link href="/writing" className="link">
          complete archive
        </Link>{" "}
        is ordered by publication date and can be filtered by any of these topics.
      </p>
    </div>
  );
}
