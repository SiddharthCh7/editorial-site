import { z } from "zod";

/**
 * Frontmatter schema for articles and projects.
 *
 * Every field that a page component reads is validated here, so a typo in
 * frontmatter fails the build with a readable message instead of rendering a
 * broken page. Optional fields have safe defaults: missing metadata must never
 * crash the rendering pipeline.
 */

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use an ISO date in the form YYYY-MM-DD");

export const articleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1, "A description is used in listings and metadata"),
  publishedAt: isoDate,
  updatedAt: isoDate.optional().nullable(),
  tags: z.array(z.string().min(1)).min(1, "At least one topic makes the piece discoverable"),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  relatedSlugs: z.array(z.string()).default([]),
  /** Optional short label shown above the title, replacing the topic name. */
  kicker: z.string().optional(),
  /** Optional named diagram rendered below the article header. */
  diagram: z.string().optional(),
  /** Caption for the diagram, including its figure number. */
  diagramCaption: z.string().optional(),
});

export const projectStatusSchema = z.enum([
  "experimental",
  "in progress",
  "maintained",
  "archived",
]);

export const projectSchema = z.object({
  title: z.string().min(1),
  summary: z.string().min(1),
  problem: z.string().min(1, "A one-line statement of the problem is required"),
  year: z.number().int().min(2000).max(2100),
  status: projectStatusSchema,
  technologies: z.array(z.string()).default([]),
  repositoryUrl: z.string().url().optional().nullable(),
  demoUrl: z.string().url().optional().nullable(),
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  /** Article slugs that discuss this project's ideas. */
  relatedSlugs: z.array(z.string()).default([]),
  /** Optional named architecture diagram. */
  diagram: z.string().optional(),
  /** Caption for the architecture diagram. */
  diagramCaption: z.string().optional(),
});

export type ArticleFrontmatter = z.infer<typeof articleSchema>;
export type ProjectFrontmatter = z.infer<typeof projectSchema>;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
