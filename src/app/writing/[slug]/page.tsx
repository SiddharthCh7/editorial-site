import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ArticleEnhancer } from "@/components/article-enhancer";
import { ProjectDiagram } from "@/components/diagrams/project-diagram";
import { ReadingProgress } from "@/components/reading-progress";
import { TableOfContents } from "@/components/table-of-contents";
import {
  getAllArticles,
  getArticle,
  getAdjacentArticles,
  getRelatedArticles,
  relationReason,
  slugifyTopic,
  topicName,
} from "@/lib/content";
import { formatDate } from "@/lib/format";
import { renderMarkdown } from "@/lib/markdown";
import { absoluteUrl, site, socialImage } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };

  const url = `/writing/${article.slug}`;
  // Social crawlers (Twitter/X, Facebook, LinkedIn) do not support SVG for link preview cards.
  // Fall back to a .png equivalent or the site-wide socialImage.
  const previewImage = article.image
    ? article.image.replace(/\.svg$/, ".png")
    : socialImage.url;

  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical: url },
    openGraph: {
      images: [
        {
          url: previewImage,
          alt: article.title,
        },
      ],
      type: "article",
      title: article.title,
      description: article.description,
      url,
      publishedTime: `${article.publishedAt}T00:00:00Z`,
      modifiedTime: `${(article.updatedAt ?? article.publishedAt)}T00:00:00Z`,
      authors: [site.name],
      tags: article.tags,
    },
    twitter: {
      images: [previewImage],
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
    robots: article.draft ? { index: false, follow: false } : undefined,
  };
}

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const html = await renderMarkdown(article.body);
  const related = getRelatedArticles(article, 3);
  const { previous, next } = getAdjacentArticles(article);
  const primaryTopic = slugifyTopic(article.tags[0]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    datePublished: `${article.publishedAt}T00:00:00Z`,
    dateModified: `${(article.updatedAt ?? article.publishedAt)}T00:00:00Z`,
    author: { "@type": "Person", name: site.name },
    keywords: article.tags.join(", "),
    mainEntityOfPage: absoluteUrl(`/writing/${article.slug}`),
    inLanguage: "en",
  };

  return (
    <>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <article>
        {/* Header --------------------------------------------------------- */}
        <div className="shell-wide">
          <div className="flex items-center justify-between gap-4 border-b border-rule py-4">
            <Link
              href="/writing"
              className="group inline-flex items-center gap-2 text-[0.8125rem] text-secondary transition-colors hover:text-ink"
            >
              <ArrowLeft
                aria-hidden="true"
                className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
                strokeWidth={1.5}
              />
              Writing
            </Link>
            <Link
              href={`/topics/${primaryTopic}`}
              className="eyebrow transition-colors hover:text-accent"
            >
              {topicName(primaryTopic)}
            </Link>
          </div>

          {article.draft && (
            <p className="mt-4 border border-accent/40 bg-accent-wash px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-accent">
              Draft - rendered in development only, excluded from the production build
            </p>
          )}

          <header className="grid gap-8 pt-10 pb-10 lg:grid-cols-12 lg:gap-12 lg:pt-14 xl:mx-auto xl:max-w-[calc(var(--measure)_+_13rem_+_3.5rem)]">
            <div className="lg:col-span-8">
              <h1 className="max-w-[26ch] font-serif text-[clamp(2.1rem,1.5rem+2.6vw,3.35rem)] leading-[1.03] tracking-[-0.025em]">
                {article.title}
              </h1>
              <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.65] text-secondary">
                {article.description}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-start border-t border-rule pt-4 text-sm lg:col-span-4 lg:mt-2">
              <div>
                <dt className="eyebrow">Published</dt>
                <dd className="mt-1 font-mono text-[0.8125rem] text-ink">
                  {formatDate(article.publishedAt)}
                </dd>
              </div>
              {article.updatedAt && (
                <div>
                  <dt className="eyebrow">Updated</dt>
                  <dd className="mt-1 font-mono text-[0.8125rem] text-ink">
                    {formatDate(article.updatedAt)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="eyebrow">Reading time</dt>
                <dd className="mt-1 font-mono text-[0.8125rem] text-ink">
                  {article.readingTime}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Length</dt>
                <dd className="mt-1 font-mono text-[0.8125rem] text-ink">
                  {article.wordCount.toLocaleString("en-GB")} words
                </dd>
              </div>
            </dl>
          </header>
        </div>

        {article.diagram && (
          <div className="shell-medium pb-4">
            <figure className="m-0">
              <ProjectDiagram name={article.diagram} />
              {article.diagramCaption && (
                <figcaption className="mt-3 text-xs leading-relaxed text-secondary">
                  {article.diagramCaption}
                </figcaption>
              )}
            </figure>
          </div>
        )}

        {/* Reading layout ------------------------------------------------ */}
        <div className="shell-wide pb-16 pt-8">
          {/* The reading column and its contents rail form one group, centred on
              the page axis at xl so the prose does not hug the left edge. The
              header uses the same width so the title and body share one edge. */}
          <div className="grid max-w-[var(--measure)] gap-x-14 gap-y-6 xl:mx-auto xl:max-w-[calc(var(--measure)_+_13rem_+_3.5rem)] xl:grid-cols-[minmax(0,var(--measure))_13rem]">
            <aside className="xl:col-start-2 xl:row-start-1">
              <TableOfContents headings={article.headings} />
            </aside>

            <div className="min-w-0 xl:col-start-1 xl:row-start-1">
              <div
                id="article-body"
                className="prose-editorial"
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <ArticleEnhancer targetId="article-body" />

              {/* Filing ------------------------------------------------- */}
              <div className="mt-14 border-t border-rule pt-5">
                <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
                  <span className="eyebrow pt-1">Filed under</span>
                  {article.tags.map((tag) => (
                    <Link key={tag} href={`/topics/${slugifyTopic(tag)}`} className="tag">
                      {tag}
                    </Link>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href="/writing"
                    className="group inline-flex items-center gap-2 text-[0.8125rem] text-secondary transition-colors hover:text-ink"
                  >
                    <ArrowLeft
                      aria-hidden="true"
                      className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
                      strokeWidth={1.5}
                    />
                    All writing
                  </Link>
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">
                    End of article
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related ------------------------------------------------------- */}
        {related.length > 0 && (
          <section aria-labelledby="related" className="shell-wide border-t border-rule pt-10 pb-14">
            <div className="section-label">
              <h2 id="related" className="eyebrow">
                Continue reading
              </h2>
            </div>
            <ul className="mt-6 grid gap-8 md:grid-cols-3 md:gap-6">
              {related.map((item, index) => (
                <li key={item.slug} className="border-t border-rule pt-4">
                  <p className="meta">
                    {String(index + 1).padStart(2, "0")} · {item.readingTime}
                  </p>
                  <h3 className="mt-2 font-serif text-[1.2rem] leading-snug">
                    <Link
                      href={`/writing/${item.slug}`}
                      className="transition-colors hover:text-accent-strong"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-secondary">
                    {relationReason(article, item)}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Prev / next --------------------------------------------------- */}
        {(previous ?? next) && (
          <nav aria-label="Article navigation" className="shell-wide pb-16">
            <div className="grid gap-px border-t border-rule pt-6 sm:grid-cols-2 sm:gap-8">
              {previous && (
                <Link href={`/writing/${previous.slug}`} className="group py-2">
                  <span className="eyebrow">← Previous piece</span>
                  <span className="mt-2 flex items-baseline gap-2 font-serif text-[1.1rem] leading-snug transition-colors group-hover:text-accent-strong">
                    {previous.title}
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={`/writing/${next.slug}`}
                  className="group py-2 sm:col-start-2 sm:text-right"
                >
                  <span className="eyebrow">Next piece →</span>
                  <span className="mt-2 flex items-baseline gap-2 font-serif text-[1.1rem] leading-snug transition-colors group-hover:text-accent-strong sm:justify-end">
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </article>
    </>
  );
}
