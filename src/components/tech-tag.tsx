import Link from "next/link";
import { getTopic } from "@/lib/content";
import { slugifyTopic } from "@/lib/topics";

/**
 * Project stacks mix subject tags ("LLM Inference") with concrete tools
 * ("Rust"). Only the former have topic pages, so the latter render as plain
 * labels instead of links to a 404.
 */
export function TechTag({ label }: { label: string }) {
  const slug = slugifyTopic(label);
  const topic = getTopic(slug);

  if (!topic) {
    return <span className="tag">{label}</span>;
  }

  return (
    <Link href={`/topics/${slug}`} className="tag">
      {label}
    </Link>
  );
}
