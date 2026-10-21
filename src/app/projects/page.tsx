import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TechTag } from "@/components/tech-tag";
import { getAllProjects } from "@/lib/content";
import { site, socialImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Engineering case studies: what the problem was, what was built, the decisions that mattered, and what remains unresolved.",
  alternates: { canonical: "/projects" },
  openGraph: {
    images: [socialImage],
    title: `Projects - ${site.name}`,
    description:
      "Engineering case studies on inference scheduling, agent tracing, and model serving.",
    url: "/projects",
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="shell-wide pt-12 pb-8 sm:pt-16">
      <header className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
            <span className="eyebrow">Case studies</span>
          </p>
          <h1 className="mt-6 max-w-[22ch] font-serif text-[clamp(2.4rem,1.8rem+2.6vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            Systems built to settle a question.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[1rem] leading-relaxed text-secondary">
            Each of these started as an argument about how something should
            work. The write-ups cover the problem, the design constraints, the
            decisions that were hard to reverse, and what is still unfinished.
            Where numbers are missing, they are missing on purpose.
          </p>
        </div>
        <div className="lg:col-span-4 lg:pt-14">
          <dl className="grid grid-cols-2 gap-y-4 border-t border-rule pt-4 text-sm">
            <div>
              <dt className="eyebrow">Projects</dt>
              <dd className="mt-1 font-mono text-ink">
                {String(projects.length).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Status</dt>
              <dd className="mt-1 font-mono text-ink">mixed, as usual</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mt-12">
        {projects.length === 0 ? (
          <p className="border-t border-rule pt-6 text-sm text-secondary">
            No public projects yet.{" "}
            <code className="font-mono text-xs">content/projects</code>.
          </p>
        ) : (
          projects.map((project, index) => (
            <article
              key={project.slug}
              className="grid gap-8 border-t border-rule py-10 lg:grid-cols-12 lg:gap-10"
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:col-span-3 lg:flex-col lg:gap-1.5">
                <span className="font-mono text-[0.6875rem] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="eyebrow text-sage">{project.status}</span>
                <span className="meta">{project.year}</span>
              </div>

              <div className="lg:col-span-6">
                <h2 className="font-serif text-[1.85rem] leading-[1.08] tracking-[-0.02em]">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="transition-colors hover:text-accent-strong"
                  >
                    {project.title}
                  </Link>
                </h2>
                <p className="mt-3 max-w-[56ch] font-serif text-[1.05rem] leading-snug text-secondary">
                  {project.problem}
                </p>
                <p className="mt-4 max-w-[62ch] text-[0.9rem] leading-relaxed text-secondary">
                  {project.summary}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {project.technologies.map((tech) => (
                    <TechTag key={tech} label={tech} />
                  ))}
                </div>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group mt-6 inline-flex items-center gap-1.5 text-[0.8125rem] text-ink transition-colors hover:text-accent-strong"
                >
                  Read the case study
                  <ArrowUpRight
                    aria-hidden="true"
                    className="arrow h-3.5 w-3.5"
                    strokeWidth={1.5}
                  />
                </Link>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-rule pt-4 text-sm lg:col-span-3 lg:grid-cols-1 lg:border-t-0 lg:pt-0">
                <div>
                  <dt className="eyebrow">Status</dt>
                  <dd className="mt-1 text-[0.8125rem] text-ink">{project.status}</dd>
                </div>
                <div>
                  <dt className="eyebrow">Stack</dt>
                  <dd className="mt-1 text-[0.8125rem] text-ink">
                    {project.technologies.length} components
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow">Read</dt>
                  <dd className="mt-1 font-mono text-[0.8125rem] text-ink">
                    {project.readingTime}
                  </dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
