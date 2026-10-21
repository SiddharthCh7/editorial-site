import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import {
  articleSchema,
  projectSchema,
  type ArticleFrontmatter,
  type ProjectFrontmatter,
} from "./schema";
import { extractHeadings, type Heading } from "./markdown";
import { topicRegistry, type TopicDefinition } from "./site";
import { slugifyTopic, topicName } from "./topics";
import type { SearchRecord } from "./types";

export { slugifyTopic, topicName };
export type { SearchRecord };

/**
 * Content layer.
 *
 * Articles and projects are plain Markdown files in `content/`. Nothing about a
 * page's structure is hardcoded: routes, listings, topic pages and the search
 * index are all derived from this module.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const WRITING_DIR = path.join(CONTENT_DIR, "writing");
const PROJECTS_DIR = path.join(CONTENT_DIR, "projects");

/** Drafts are visible while writing locally, and never in a production build. */
export const showDrafts = process.env.NODE_ENV !== "production";

export type Article = ArticleFrontmatter & {
  slug: string;
  body: string;
  readingTime: string;
  readingMinutes: number;
  headings: Heading[];
  wordCount: number;
};

export type Project = ProjectFrontmatter & {
  slug: string;
  body: string;
  readingTime: string;
  headings: Heading[];
};

function readDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
}

function formatIssues(file: string, issues: { path: (string | number | symbol)[]; message: string }[]) {
  const detail = issues
    .map((issue) => `  · ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  return `Invalid frontmatter in content file "${file}":\n${detail}`;
}

const byNewest = (a: { publishedAt: string }, b: { publishedAt: string }) =>
  b.publishedAt.localeCompare(a.publishedAt);

function loadArticles(): Article[] {
  return readDir(WRITING_DIR)
    .map((file) => {
      const raw = fs.readFileSync(path.join(WRITING_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const parsed = articleSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(formatIssues(`writing/${file}`, parsed.error.issues));
      }

      const slug = file.replace(/\.mdx?$/, "");
      const stats = readingTime(content);

      return {
        ...parsed.data,
        slug,
        body: content,
        readingTime: `${Math.max(1, Math.round(stats.minutes))} min read`,
        readingMinutes: Math.max(1, Math.round(stats.minutes)),
        headings: extractHeadings(content),
        wordCount: stats.words,
      } satisfies Article;
    })
    .sort(byNewest);
}

function loadProjects(): Project[] {
  return readDir(PROJECTS_DIR)
    .map((file) => {
      const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8");
      const { data, content } = matter(raw);
      const parsed = projectSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(formatIssues(`projects/${file}`, parsed.error.issues));
      }
      return {
        ...parsed.data,
        slug: file.replace(/\.mdx?$/, ""),
        body: content,
        readingTime: `${Math.max(1, Math.round(readingTime(content).minutes))} min read`,
        headings: extractHeadings(content),
      } satisfies Project;
    })
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

const articles = loadArticles();
const projects = loadProjects();

/** Every article the build is allowed to expose, newest first. */
export function getAllArticles(): Article[] {
  return showDrafts ? articles : articles.filter((article) => !article.draft);
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

export function getAllProjects(): Project[] {
  return showDrafts ? projects : projects.filter((project) => !project.draft);
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getFeaturedArticle(): Article | undefined {
  return getAllArticles().find((article) => article.featured);
}

export function getFeaturedProject(): Project | undefined {
  return getAllProjects().find((project) => project.featured);
}

export function getRecentArticles(limit: number, excludeSlug?: string): Article[] {
  return getAllArticles()
    .filter((article) => article.slug !== excludeSlug)
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Topics                                                                      */
/* -------------------------------------------------------------------------- */

export type Topic = TopicDefinition & {
  articleCount: number;
  projectCount: number;
  /** Most recent article, used for ordering and descriptions. */
  latest?: Article;
};

/** Topics are derived from real content, so no topic page is ever empty. */
export function getAllTopics(): Topic[] {
  const allArticles = getAllArticles();
  const allProjects = getAllProjects();
  const map = new Map<string, Topic>();

  const ensure = (slug: string): Topic => {
    const existing = map.get(slug);
    if (existing) return existing;
    const defined = topicRegistry.find((topic) => topic.slug === slug);
    const base: TopicDefinition = defined ?? {
      slug,
      name: topicName(slug),
      description: "Essays and notes filed under this topic.",
      order: 999,
    };
    const created: Topic = { ...base, articleCount: 0, projectCount: 0 };
    map.set(slug, created);
    return created;
  };

  for (const article of allArticles) {
    for (const tag of article.tags) {
      const topic = ensure(slugifyTopic(tag));
      topic.articleCount += 1;
      if (!topic.latest || article.publishedAt > topic.latest.publishedAt) {
        topic.latest = article;
      }
    }
  }

  for (const project of allProjects) {
    for (const tag of project.technologies) {
      const slug = slugifyTopic(tag);
      const topic = map.get(slug);
      if (topic) topic.projectCount += 1;
    }
  }

  return [...map.values()].sort(
    (a, b) => a.order - b.order || b.articleCount - a.articleCount || a.name.localeCompare(b.name),
  );
}

export function getTopic(slug: string): Topic | undefined {
  return getAllTopics().find((topic) => topic.slug === slug);
}

export function getTopicArticles(slug: string): Article[] {
  return getAllArticles().filter((article) =>
    article.tags.some((tag) => slugifyTopic(tag) === slug),
  );
}

export function getTopicProjects(slug: string): Project[] {
  return getAllProjects().filter((project) =>
    project.technologies.some((tag) => slugifyTopic(tag) === slug),
  );
}

/**
 * Related topics are the ones that co-occur most often with this topic across
 * the archive. A relationship has to be earned by real articles.
 */
export function getRelatedTopics(slug: string, limit = 3): Topic[] {
  const counts = new Map<string, number>();
  for (const article of getTopicArticles(slug)) {
    for (const tag of article.tags) {
      const candidate = slugifyTopic(tag);
      if (candidate === slug) continue;
      counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
    }
  }
  const all = getAllTopics();
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([candidate]) => all.find((topic) => topic.slug === candidate))
    .filter((topic): topic is Topic => Boolean(topic))
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Related reading                                                             */
/* -------------------------------------------------------------------------- */

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const pool = getAllArticles().filter((candidate) => candidate.slug !== article.slug);
  const scored = pool.map((candidate) => {
    const explicit = article.relatedSlugs.includes(candidate.slug) ? 100 : 0;
    const reverse = candidate.relatedSlugs.includes(article.slug) ? 40 : 0;
    const shared = candidate.tags.filter((tag) => article.tags.includes(tag)).length;
    return {
      candidate,
      score: explicit + reverse + shared * 10,
    };
  });

  const related = scored
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.publishedAt.localeCompare(a.candidate.publishedAt),
    )
    .map((entry) => entry.candidate)
    .slice(0, limit);

  // Never leave the reader at a dead end: fall back to the most recent work.
  if (related.length < limit) {
    for (const candidate of pool) {
      if (related.length >= limit) break;
      if (!related.some((existing) => existing.slug === candidate.slug)) {
        related.push(candidate);
      }
    }
  }

  return related;
}

/**
 * One sentence explaining why a reader might continue to this piece. It is
 * derived from real metadata, never written per-pair by hand.
 */
export function relationReason(source: Article, target: Article): string {
  const shared = target.tags.filter((tag) => source.tags.includes(tag));
  if (source.relatedSlugs.includes(target.slug)) {
    return shared.length
      ? `Named as a follow-up to this piece - it continues the ${shared[0]} thread.`
      : "Named as a follow-up to this piece.";
  }
  if (shared.length === 1) {
    return `Another pass at ${shared[0]} from a different angle.`;
  }
  if (shared.length > 1) {
    return `Sits where ${shared[0]} and ${shared[1]} meet - the same problem, one layer down.`;
  }
  return "A different thread from the same notebook.";
}

export function getAdjacentArticles(article: Article): {
  previous?: Article;
  next?: Article;
} {
  const all = getAllArticles().sort(byNewest);
  const index = all.findIndex((candidate) => candidate.slug === article.slug);
  if (index === -1) return {};
  return {
    next: all[index - 1],
    previous: all[index + 1],
  };
}

export function getRelatedProjects(project: Project, limit = 2): Project[] {
  return getAllProjects()
    .filter((candidate) => candidate.slug !== project.slug)
    .map((candidate) => ({
      candidate,
      score: candidate.technologies.filter((tech) => project.technologies.includes(tech)).length,
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
}

export function getProjectArticles(project: Project): Article[] {
  const explicit = project.relatedSlugs
    .map((slug) => getArticle(slug))
    .filter((article): article is Article => Boolean(article));

  if (explicit.length > 0) return explicit;

  return getAllArticles()
    .map((article) => ({
      article,
      score: article.tags.filter((tag) =>
        project.technologies.some((tech) => slugifyTopic(tech) === slugifyTopic(tag)),
      ).length,
    }))
    .filter((entry) => entry.score > 0)
    .slice(0, 3)
    .map((entry) => entry.article);
}

/* -------------------------------------------------------------------------- */
/* Search index                                                                */
/* -------------------------------------------------------------------------- */

/** Built once at build time and shipped as data - no search service needed. */
export function getSearchIndex(): SearchRecord[] {
  const articleRecords: SearchRecord[] = getAllArticles().map((article) => ({
    type: "article",
    title: article.title,
    href: `/writing/${article.slug}`,
    description: article.description,
    tags: article.tags,
    date: article.publishedAt,
    readingTime: article.readingTime,
  }));

  const projectRecords: SearchRecord[] = getAllProjects().map((project) => ({
    type: "project",
    title: project.title,
    href: `/projects/${project.slug}`,
    description: project.summary,
    tags: project.technologies,
    date: String(project.year),
  }));

  return [...articleRecords, ...projectRecords];
}
