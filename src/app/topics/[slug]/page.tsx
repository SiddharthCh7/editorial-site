import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ArticleRow } from "@/components/article-row";
import { socialImage } from "@/lib/site";
import {
  getAllTopics,
  getRelatedTopics,
  getTopic,
  getTopicArticles,
  getTopicProjects,
} from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllTopics()
    .filter((topic) => topic.articleCount > 0)
    .map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) return { title: "Topic not found" };

  return {
    title: `${topic.name} - Topic`,
    description: topic.description,
    alternates: { canonical: `/topics/${topic.slug}` },
    openGraph: {
      images: [socialImage],
      title: `${topic.name} - a topic on this site`,
      description: topic.description,
      url: `/topics/${topic.slug}`,
    },
  };
}

export default async function TopicPage({ params }: Params) {
  const { slug } = await params;
  const topic = getTopic(slug);
  if (!topic) notFound();

  const articles = getTopicArticles(slug);
  const projects = getTopicProjects(slug);
  const related = getRelatedTopics(slug, 3);

  return (
    <div className="shell-wide pt-10 pb-10">
      <Link
        href="/topics"
        className="group inline-flex items-center gap-2 text-[0.8125rem] text-secondary transition-colors hover:text-ink"
      >
        <ArrowLeft
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
          strokeWidth={1.5}
        />
        Topics
      </Link>

      <header className="mt-10 grid gap-8 border-b border-rule pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow">Topic</p>
          <h1 className="mt-4 max-w-[24ch] font-serif text-[clamp(2.2rem,1.6rem+2.6vw,3.4rem)] leading-[1.02] tracking-[-0.025em]">
            {topic.name}
          </h1>
          <p className="mt-5 max-w-[56ch] text-[1rem] leading-relaxed text-secondary">
            {topic.description}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-start border-t border-rule pt-4 text-sm lg:col-span-4 lg:mt-2">
          <div>
            <dt className="eyebrow">Articles</dt>
            <dd className="mt-1 font-mono text-ink">
              {String(topic.articleCount).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Projects</dt>
            <dd className="mt-1 font-mono text-ink">
              {String(topic.projectCount).padStart(2, "0")}
            </dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="topic-articles" className="mt-10">
        <div className="section-label">
          <h2 id="topic-articles" className="eyebrow">
            Articles in this thread
          </h2>
        </div>
        {articles.length === 0 ? (
          <p className="py-8 text-sm text-secondary">
            Nothing published under this topic yet.
          </p>
        ) : (
          <div>
            {articles.map((article) => (
              <ArticleRow key={article.slug} article={article} />
            ))}
            <div className="border-t border-rule" />
          </div>
        )}
      </section>

      {projects.length > 0 && (
        <section aria-labelledby="topic-projects" className="mt-14">
          <div className="section-label">
            <h2 id="topic-projects" className="eyebrow">
              Projects
            </h2>
          </div>
          <ul className="mt-2">
            {projects.map((project) => (
              <li key={project.slug} className="border-b border-rule">
                <Link
                  href={`/projects/${project.slug}`}
                  className="group grid gap-3 py-6 sm:grid-cols-12 sm:gap-6"
                >
                  <span className="meta sm:col-span-3">
                    {project.year} · {project.status}
                  </span>
                  <span className="sm:col-span-9">
                    <span className="block font-serif text-[1.25rem] leading-snug transition-colors group-hover:text-accent-strong">
                      {project.title}
                    </span>
                    <span className="mt-1 block max-w-[62ch] text-[0.875rem] leading-relaxed text-secondary">
                      {project.problem}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section aria-labelledby="related-topics" className="mt-14">
          <div className="section-label">
            <h2 id="related-topics" className="eyebrow">
              Adjacent threads
            </h2>
          </div>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={`/topics/${entry.slug}`}
                  className="group flex items-start justify-between gap-3 border-t border-rule pt-3"
                >
                  <span>
                    <span className="block text-[0.9375rem] transition-colors group-hover:text-accent-strong">
                      {entry.name}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] text-secondary">
                      {entry.articleCount} {entry.articleCount === 1 ? "piece" : "pieces"}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="arrow mt-1 h-3.5 w-3.5 shrink-0 text-accent"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
