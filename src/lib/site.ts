/**
 * Site configuration.
 *
 * Everything that appears in more than one place lives here: identity,
 * navigation, footer, homepage copy and the topic registry.
 *
 * PLACEHOLDER IDENTITY - the name, descriptor and contact details below are
 * editable stand-ins. Replace them with your own before publishing. No
 * employment history, credentials, metrics, social profiles or publications
 * have been invented anywhere in this project.
 */

export type NavItem = {
  label: string;
  href: string;
};

export const site = {
  /** Replace with your own name. */
  name: "Sid",
  /** Short wordmark used in the header. Keep it to a few characters. */
  wordmark: "Sid",
  /** Small mono descriptor that sits next to the wordmark. */
  descriptor: "AI systems",
  /** Editorial subtitle used in metadata and the footer. */
  tagline: "Notes on LLM inference, agents, and the systems underneath them.",
  description:
    "An independent engineering publication about LLM inference, AI agents, and the systems that make them work - long-form deep dives, project case studies, and a working notebook.",
  /** Set to a real domain before deploying, e.g. "https://example.com". */
  url: "https://example.com",
  /** Leave empty until a real address exists. Never invent one. */
  email: "",
  /** Leave empty or add verified profile URLs only. */
  socials: [] as { label: string; href: string }[],
  locale: "en_US",
  /** Used to date the feed and to sort "recent" content. */
  established: "2026",
} as const;

export const navigation: NavItem[] = [
  { label: "Writing", href: "/writing" },
  { label: "Projects", href: "/projects" },
  { label: "Topics", href: "/topics" },
  { label: "About", href: "/about" },
];

export const hero = {
  eyebrow: "Independent engineering notes",
  headline: "Understanding the systems beneath intelligence.",
  intro:
    "I write about LLM inference, AI agents, and the engineering that makes them work - with a broader curiosity about how systems, ideas, and incentives shape our world.",
  primaryCta: { label: "Read the writing", href: "/writing" },
  secondaryCta: { label: "Selected projects", href: "/projects" },
};

export const closing = {
  eyebrow: "Keep reading",
  title: "The archive is the point.",
  body: "Long-form essays on inference, agents, and systems engineering, plus case studies of things built and taken apart. Start anywhere, or follow a topic through the whole body of work.",
  links: [
    { label: "All writing", href: "/writing" },
    { label: "Topics", href: "/topics" },
    { label: "Projects", href: "/projects" },
  ],
};

/**
 * Topic registry. Topic pages are generated from the tags used in article and
 * project frontmatter, so adding a tag here is what gives it a description and
 * a place in the index. Tags without an entry still render, using a generated
 * description, so the site never breaks when a new tag appears.
 */
export type TopicDefinition = {
  slug: string;
  name: string;
  description: string;
  /** Optional editorial ordering for the topics index. Lower comes first. */
  order: number;
};

export const topicRegistry: TopicDefinition[] = [
  {
    slug: "llm-inference",
    name: "LLM Inference",
    description:
      "Scheduling, batching, caching and decoding: the machinery that turns a trained model into a service with latency and throughput budgets.",
    order: 1,
  },
  {
    slug: "ai-agents",
    name: "AI Agents",
    description:
      "Loops, tools, state and failure modes. What separates an agent that recovers from one that quietly corrupts its own work.",
    order: 2,
  },
  {
    slug: "llm-systems",
    name: "LLM Systems",
    description:
      "The layer above a single request: routing, evaluation harnesses, observability, and the operational shape of a model-backed product.",
    order: 3,
  },
  {
    slug: "model-optimization",
    name: "Model Optimization",
    description:
      "Quantization, speculative decoding, kernels and the honest accounting of what each technique actually buys you.",
    order: 4,
  },
  {
    slug: "systems-engineering",
    name: "Systems Engineering",
    description:
      "Reading unfamiliar systems, reasoning about failure, and the discipline of changing software you did not write.",
    order: 5,
  },
  {
    slug: "notation",
    name: "Notation",
    description:
      "Shorter pieces on vocabulary, mental models, and the small misunderstandings that compound into large ones.",
    order: 6,
  },
];

export const topicBySlug = new Map(topicRegistry.map((topic) => [topic.slug, topic]));

/** Homepage copy that is not derived from content. */
export const homeCopy = {
  writing: {
    eyebrow: "Selected writing",
    title: "Recent notes",
    body: "Long-form pieces, working notes, and post-mortems. Everything is written to be read once, carefully.",
  },
  project: {
    eyebrow: "Featured project",
    title: "Case study",
  },
  topics: {
    eyebrow: "Topic index",
    title: "Areas of work",
    body: "An index rather than a taxonomy. Follow a thread and the pieces will accumulate into an argument.",
  },
};

/** The generated share card in `src/app/opengraph-image.tsx`. */
export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${site.name} - an independent publication on AI systems`,
};

export function absoluteUrl(path = "/"): string {
  const base = site.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
