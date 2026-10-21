import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ArticleLead, ArticleRow } from "@/components/article-row";
import { PipelineDiagram } from "@/components/diagrams/pipeline-diagram";
import { ProjectDiagram } from "@/components/diagrams/project-diagram";
import {
  getAllArticles,
  getAllProjects,
  getAllTopics,
  getFeaturedProject,
  getRecentArticles,
} from "@/lib/content";
import { closing, hero, homeCopy, site } from "@/lib/site";

export default function HomePage() {
  const articles = getRecentArticles(4);
  const [lead, ...rest] = articles;
  const project = getFeaturedProject() ?? getAllProjects()[0];
  const topics = getAllTopics().filter((topic) => topic.articleCount > 0);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    description: site.description,
    url: site.url,
    author: {
      "@type": "Person",
      name: site.name,
      description: site.tagline,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Hero ---------------------------------------------------------------- */}
      <section className="shell-wide pt-12 pb-16 sm:pt-16 md:pb-20">
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 lg:pt-2">
            <p className="flex items-center gap-3">
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
              <span className="eyebrow">{hero.eyebrow}</span>
            </p>

            <h1 className="mt-7 max-w-[19ch] font-serif text-[clamp(2.6rem,1.7rem+4.2vw,4.4rem)] leading-[0.99] tracking-[-0.025em]">
              {hero.headline}
            </h1>

            <p className="mt-7 max-w-[46ch] text-[0.98rem] leading-[1.7] text-secondary sm:text-[1.0625rem]">
              {hero.intro}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={hero.primaryCta.href} className="btn btn-primary">
                {hero.primaryCta.label}
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="group inline-flex items-center gap-1.5 text-[0.8125rem] text-secondary transition-colors hover:text-ink"
              >
                {hero.secondaryCta.label}
                <ArrowUpRight aria-hidden="true" className="arrow h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>

            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-rule pt-5">
              <div>
                <dt className="eyebrow">Writing</dt>
                <dd className="mt-1 font-mono text-sm text-ink">
                  {String(getAllArticles().length).padStart(2, "0")} pieces
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Projects</dt>
                <dd className="mt-1 font-mono text-sm text-ink">
                  {String(getAllProjects().length).padStart(2, "0")} case studies
                </dd>
              </div>
              <div>
                <dt className="eyebrow">Topics</dt>
                <dd className="mt-1 font-mono text-sm text-ink">
                  {String(topics.length).padStart(2, "0")} threads
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-5">
            <PipelineDiagram />
          </div>
        </div>
      </section>

      {/* Selected writing ---------------------------------------------------- */}
      <section aria-labelledby="selected-writing" className="shell-wide pb-16 sm:pb-20">
        <div className="section-label">
          <span className="eyebrow">01 - {homeCopy.writing.eyebrow}</span>
          <span className="eyebrow hidden sm:inline">{homeCopy.writing.title}</span>
        </div>

        <div className="mt-6 flex flex-col gap-4 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-[52ch] text-sm leading-relaxed text-secondary">
            {homeCopy.writing.body}
          </p>
          <Link
            href="/writing"
            className="group inline-flex shrink-0 items-center gap-1.5 text-[0.8125rem] text-ink transition-colors hover:text-accent-strong"
          >
            All writing
            <ArrowRight aria-hidden="true" className="arrow h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        {lead ? (
          <div>
            <ArticleLead article={lead} />
            {rest.map((article) => (
              <ArticleRow key={article.slug} article={article} />
            ))}
            <div className="border-t border-rule" />
          </div>
        ) : (
          <p className="border-t border-rule pt-6 text-sm text-secondary">
            No published writing yet. Add a Markdown file to{" "}
            <code className="font-mono text-xs">content/writing</code> to get started.
          </p>
        )}
      </section>

      {/* Featured project ---------------------------------------------------- */}
      {project && (
        <section aria-labelledby="featured-project" className="on-panel">
          <div className="shell-wide py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <p className="eyebrow">{homeCopy.project.eyebrow}</p>
                <h2
                  id="featured-project"
                  className="mt-4 font-serif text-[clamp(1.9rem,1.4rem+2vw,2.75rem)] leading-[1.05] tracking-[-0.02em]"
                >
                  {project.title}
                </h2>
                <p className="mt-4 max-w-[42ch] text-[1rem] leading-relaxed text-[var(--ink-secondary)]">
                  {project.problem}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-[var(--ink-muted)]">
                  <span>{project.status}</span>
                  <span aria-hidden="true">/</span>
                  <span>{project.year}</span>
                  <span aria-hidden="true">/</span>
                  <span>{project.technologies.slice(0, 3).join(" · ")}</span>
                </div>

                <Link
                  href={`/projects/${project.slug}`}
                  className="group mt-8 inline-flex items-center gap-2 border-b border-[var(--accent)] pb-1 text-[0.875rem] text-[var(--accent-strong)] transition-colors hover:text-[var(--panel-ink)] hover:border-[var(--panel-ink)]"
                >
                  Read the case study
                  <ArrowRight aria-hidden="true" className="arrow h-3.5 w-3.5" strokeWidth={1.5} />
                </Link>
              </div>

              <div className="lg:col-span-7">
                <p className="measure text-[0.95rem] leading-[1.7] text-[var(--ink-secondary)]">
                  {project.summary}
                </p>
                <div className="mt-7">
                  <ProjectDiagram name={project.diagram} />
                </div>
                <p className="mt-3 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--ink-muted)]">
                  Fig. 2 - {project.title} · request path and its resource boundary
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Topics -------------------------------------------------------------- */}
      <section aria-labelledby="topics-heading" className="shell-wide pt-16 pb-16 sm:pt-20">
        <div className="section-label">
          <span className="eyebrow">02 - {homeCopy.topics.eyebrow}</span>
          <span className="eyebrow hidden sm:inline">{homeCopy.topics.title}</span>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="topics-heading" className="font-serif text-[1.75rem] leading-tight tracking-[-0.015em]">
              {homeCopy.topics.title}
            </h2>
            <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-secondary">
              {homeCopy.topics.body}
            </p>
          </div>

          <ul className="lg:col-span-8">
            {topics.map((topic, index) => (
              <li key={topic.slug} className="border-t border-rule last:border-b">
                <Link
                  href={`/topics/${topic.slug}`}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-1 py-4 transition-colors hover:bg-surface sm:gap-x-6"
                >
                  <span className="font-mono text-[0.6875rem] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-[1.15rem] leading-snug transition-colors group-hover:text-accent-strong">
                      {topic.name}
                    </span>
                    <span className="mt-0.5 line-clamp-1 block max-w-[54ch] text-[0.8125rem] text-secondary">
                      {topic.description}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted">
                    {topic.articleCount} {topic.articleCount === 1 ? "piece" : "pieces"}
                    <ArrowRight
                      aria-hidden="true"
                      className="arrow h-3.5 w-3.5 text-accent opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={1.5}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing ------------------------------------------------------------- */}
      <section aria-labelledby="closing" className="shell-wide pb-4">
        <div className="border-y border-rule py-12 md:py-16">
          <div className="grid gap-8 md:grid-cols-12">
            <div className="md:col-span-7">
              <p className="eyebrow">{closing.eyebrow}</p>
              <h2
                id="closing"
                className="mt-4 max-w-[22ch] font-serif text-[clamp(1.9rem,1.4rem+2vw,2.6rem)] leading-[1.05] tracking-[-0.02em]"
              >
                {closing.title}
              </h2>
              <p className="mt-4 max-w-[48ch] text-[0.95rem] leading-relaxed text-secondary">
                {closing.body}
              </p>
            </div>
            <ul className="md:col-span-5 md:justify-self-end md:pt-8">
              {closing.links.map((link) => (
                <li key={link.href} className="border-t border-rule last:border-b">
                  <Link
                    href={link.href}
                    className="group flex items-center justify-between gap-6 py-3.5 text-[0.9375rem] transition-colors hover:text-accent-strong"
                  >
                    {link.label}
                    <ArrowRight
                      aria-hidden="true"
                      className="arrow h-4 w-4 text-accent"
                      strokeWidth={1.5}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
