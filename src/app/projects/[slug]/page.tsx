import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Code2 } from "lucide-react";
import { ProjectDiagram } from "@/components/diagrams/project-diagram";
import { TechTag } from "@/components/tech-tag";
import {
  getAllProjects,
  getProject,
  getProjectArticles,
  getRelatedProjects,
} from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { socialImage } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project not found" };

  const url = `/projects/${project.slug}`;
  return {
    title: project.title,
    description: project.summary,
    keywords: project.technologies,
    alternates: { canonical: url },
    openGraph: {
      images: [socialImage],
      type: "article",
      title: project.title,
      description: project.summary,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.summary,
    },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const html = await renderMarkdown(project.body);
  const articles = getProjectArticles(project);
  const relatedProjects = getRelatedProjects(project);

  return (
    <article>
      <div className="shell-wide">
        <div className="flex items-center justify-between gap-4 border-b border-rule py-4">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 text-[0.8125rem] text-secondary transition-colors hover:text-ink"
          >
            <ArrowLeft
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={1.5}
            />
            Projects
          </Link>
          <span className="eyebrow">Case study · {project.year}</span>
        </div>

        <header className="grid gap-10 pt-10 pb-12 lg:grid-cols-12 lg:gap-12 lg:pt-14 xl:mx-auto xl:max-w-[calc(var(--measure)_+_13rem_+_3.5rem)]">
          <div className="lg:col-span-8">
            <p className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 border border-sage/40 bg-sage-wash px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-sage">
                <span aria-hidden="true" className="h-1 w-1 bg-sage" />
                {project.status}
              </span>
              {project.technologies.slice(0, 4).map((tech) => (
                <TechTag key={tech} label={tech} />
              ))}
            </p>

            <h1 className="mt-6 max-w-[24ch] font-serif text-[clamp(2.2rem,1.6rem+2.6vw,3.4rem)] leading-[1.02] tracking-[-0.025em]">
              {project.title}
            </h1>
            <p className="mt-5 max-w-[58ch] font-serif text-[1.2rem] leading-[1.45] text-secondary">
              {project.problem}
            </p>

            {(project.repositoryUrl ?? project.demoUrl) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn"
                  >
                    <Code2 aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Source
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="btn"
                  >
                    Demonstration
                    <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </a>
                )}
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 self-start border-t border-rule pt-5 text-sm lg:col-span-4 lg:mt-2 lg:grid-cols-1">
            <div>
              <dt className="eyebrow">Status</dt>
              <dd className="mt-1 text-[0.875rem] text-ink">{project.status}</dd>
            </div>
            <div>
              <dt className="eyebrow">Year</dt>
              <dd className="mt-1 font-mono text-[0.875rem] text-ink">{project.year}</dd>
            </div>
            <div>
              <dt className="eyebrow">Stack</dt>
              <dd className="mt-1 text-[0.875rem] leading-relaxed text-ink">
                {project.technologies.join(", ")}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Repository</dt>
              <dd className="mt-1 text-[0.875rem] text-ink">
                {project.repositoryUrl ? (
                  <a href={project.repositoryUrl} className="link-accent" target="_blank" rel="noreferrer noopener">
                    Public source
                  </a>
                ) : (
                  <span className="text-secondary">Not published</span>
                )}
              </dd>
            </div>
          </dl>
        </header>
      </div>

      {project.diagram && (
        <div className="shell-medium pb-10">
          <figure className="m-0">
            <ProjectDiagram name={project.diagram} />
            {project.diagramCaption && (
              <figcaption className="mt-3 text-xs leading-relaxed text-secondary">
                {project.diagramCaption}
              </figcaption>
            )}
          </figure>
        </div>
      )}

      <div className="shell-wide pb-16">
        <div className="grid max-w-[var(--measure)] gap-x-14 gap-y-10 xl:mx-auto xl:max-w-[calc(var(--measure)_+_13rem_+_3.5rem)] xl:grid-cols-[minmax(0,var(--measure))_13rem]">
          <div className="min-w-0">
            <div
              className="prose-editorial"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-5">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-[0.8125rem] text-secondary transition-colors hover:text-ink"
              >
                <ArrowLeft
                  aria-hidden="true"
                  className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
                  strokeWidth={1.5}
                />
                All projects
              </Link>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-muted">
                End of case study
              </span>
            </div>
          </div>

          <aside className="hidden xl:col-start-2 xl:row-start-1 xl:block">
            <div className="border-t border-rule pt-4">
              <p className="eyebrow">In this study</p>
              <ol className="mt-3 space-y-1.5">
                {project.headings.map((heading) => (
                  <li key={heading.id}>
                    <a
                      href={`#${heading.id}`}
                      className="block text-[0.8125rem] leading-snug text-secondary transition-colors hover:text-ink"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </div>

      {articles.length > 0 && (
        <section aria-labelledby="project-writing" className="shell-wide border-t border-rule pt-10 pb-14">
          <div className="section-label">
            <h2 id="project-writing" className="eyebrow">
              Writing that pairs with this project
            </h2>
          </div>
          <ul className="mt-6 grid gap-8 md:grid-cols-3 md:gap-6">
            {articles.map((article, index) => (
              <li key={article.slug} className="border-t border-rule pt-4">
                <p className="meta">
                  {String(index + 1).padStart(2, "0")} · {article.readingTime}
                </p>
                <h3 className="mt-2 font-serif text-[1.2rem] leading-snug">
                  <Link
                    href={`/writing/${article.slug}`}
                    className="transition-colors hover:text-accent-strong"
                  >
                    {article.title}
                  </Link>
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-secondary">
                  {article.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedProjects.length > 0 && (
        <section aria-labelledby="related-projects" className="shell-wide pb-16">
          <div className="section-label">
            <h2 id="related-projects" className="eyebrow">
              Related projects
            </h2>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {relatedProjects.map((related) => (
              <li key={related.slug} className="border-t border-rule pt-4">
                <p className="meta">
                  {related.status} · {related.year}
                </p>
                <h3 className="mt-2 font-serif text-[1.2rem] leading-snug">
                  <Link
                    href={`/projects/${related.slug}`}
                    className="transition-colors hover:text-accent-strong"
                  >
                    {related.title}
                  </Link>
                </h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-secondary">
                  {related.summary}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
