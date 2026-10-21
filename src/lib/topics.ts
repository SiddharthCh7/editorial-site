import { topicRegistry } from "./site";

/**
 * Topic slug helpers.
 *
 * Kept in their own module, free of `node:fs`, so client components (filters,
 * search result labels) can use them without pulling the content loader into a
 * browser bundle.
 */

export function slugifyTopic(tag: string): string {
  return tag
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Registered topic names win; otherwise the slug is humanised. */
export function topicName(slug: string): string {
  const known = topicRegistry.find((topic) => topic.slug === slug);
  if (known) return known.name;
  return slug
    .split("-")
    .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
    .join(" ");
}
