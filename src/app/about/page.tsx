import type { Metadata } from "next";
import Link from "next/link";
import { getRecentArticles } from "@/lib/content";
import { site, socialImage } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "What this publication covers, how it is written, and how it is built. An independent notebook on LLM inference, agents, and systems engineering.",
  alternates: { canonical: "/about" },
  openGraph: {
    images: [socialImage],
    title: `About - ${site.name}`,
    description:
      "What this publication covers, how it is written, and how it is built.",
    url: "/about",
  },
};

/**
 * About copy is intentionally about interests and method rather than
 * credentials. Replace the placeholder text with your own; nothing here claims
 * employment, education, or results.
 */
export default function AboutPage() {
  const recent = getRecentArticles(3);

  return (
    <div className="shell-wide pt-12 pb-10 sm:pt-16">
      <header className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="flex items-center gap-3">
            <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
            <span className="eyebrow">About</span>
          </p>
          <h1 className="mt-6 max-w-[22ch] font-serif text-[clamp(2.4rem,1.8rem+2.6vw,3.6rem)] leading-[1.02] tracking-[-0.025em]">
            A notebook about how these systems actually work.
          </h1>
          <p className="mt-6 max-w-[58ch] text-[1.0625rem] leading-[1.65] text-secondary">
            I work on the engineering side of language models: inference
            systems, agent loops, and the observability that makes their
            behaviour debuggable. This site is where the explanations get worked
            out in public, at whatever length the idea requires.
          </p>
        </div>

        <aside className="lg:col-span-4 lg:pt-16">
          <dl className="border-t border-rule pt-4 text-sm">
            <div className="border-b border-rule py-3">
              <dt className="eyebrow">Focus</dt>
              <dd className="mt-1 text-[0.875rem] text-ink">
                Inference, agents, systems
              </dd>
            </div>
            <div className="border-b border-rule py-3">
              <dt className="eyebrow">Cadence</dt>
              <dd className="mt-1 text-[0.875rem] text-ink">
                Irregular, when there is something to say
              </dd>
            </div>
            <div className="border-b border-rule py-3">
              <dt className="eyebrow">Feed</dt>
              <dd className="mt-1 text-[0.875rem]">
                <Link href="/rss.xml" className="link-accent">
                  RSS
                </Link>
              </dd>
            </div>
          </dl>
        </aside>
      </header>

      <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-8">
          <section aria-labelledby="work">
            <div className="section-label">
              <h2 id="work" className="eyebrow">
                01 - What I work on
              </h2>
            </div>
            <div className="prose-editorial mt-6 max-w-[64ch]">
              <p>
                Most of my attention goes to the distance between a model that
                scores well and a system that behaves well under load. That
                means request scheduling and batching, memory hierarchies and
                the KV cache, decoding strategies, and the unglamorous plumbing
                that decides whether a latency budget survives contact with real
                traffic.
              </p>
              <p>
                The second thread is agents: models given tools, state, and time.
                An agent is a distributed system with a language model inside
                it, and most of the interesting failures are systems failures -
                lost observations, retries that duplicate effects, context that
                quietly stops matching reality.
              </p>
              <p>The questions I keep returning to:</p>
              <ul>
                <li>
                  Which parts of inference are actually bounded by memory
                  bandwidth, and which are bounded by scheduling decisions?
                </li>
                <li>
                  What does an agent need to record so that a failure can be
                  reconstructed a week later?
                </li>
                <li>
                  When a technique is described as a speedup, what was held
                  constant, and for how long?
                </li>
              </ul>
            </div>
          </section>

          <section aria-labelledby="method" className="mt-14">
            <div className="section-label">
              <h2 id="method" className="eyebrow">
                02 - How I write
              </h2>
            </div>
            <div className="prose-editorial mt-6 max-w-[64ch]">
              <p>
                The standard is simple and hard to meet: explain the mechanism,
                not the metaphor. If a piece argues that a system is faster, it
                should say what was measured, on what, and where the measurement
                stops being trustworthy. Where I am reasoning rather than
                reporting, I try to say so.
              </p>
              <p>
                Pieces are revised. When something changes materially, the
                article header shows an updated date rather than pretending the
                original was always right. Numbers that were never measured do
                not appear, and project write-ups describe trade-offs
                qualitatively when there is no honest way to quantify them.
              </p>
              <blockquote>
                <p>
                  A useful technical essay leaves the reader able to predict
                  something they could not predict before.
                </p>
              </blockquote>
            </div>
          </section>

          <section aria-labelledby="colophon" className="mt-14">
            <div className="section-label">
              <h2 id="colophon" className="eyebrow">
                03 - Colophon
              </h2>
            </div>
            <div className="prose-editorial mt-6 max-w-[64ch]">
              <p>
                The site is statically generated with Next.js and TypeScript.
                Articles and projects are Markdown files with validated
                frontmatter, parsed at build time; there is no database, no CMS,
                and no runtime API. Search runs against a small index generated
                from the same content.
              </p>
              <p>
                Type is set in Newsreader for editorial text, Inter for
                interface text, and JetBrains Mono for code and metadata. The
                diagrams are hand-written SVG rather than images. There are no
                third-party analytics or tracking scripts in this build.
              </p>
            </div>
          </section>

          <div className="mt-14 border-t border-rule pt-5">
            <p className="text-sm text-secondary">
              Start with{" "}
              <Link href="/writing" className="link">
                the archive
              </Link>
              , or follow a{" "}
              <Link href="/topics" className="link">
                topic thread
              </Link>
              .
            </p>
          </div>
        </div>

        <aside className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-[calc(var(--header-height)+2rem)] border-t border-rule pt-4">
            <p className="eyebrow">Recent pieces</p>
            <ol className="mt-3 space-y-3 text-[0.875rem] leading-snug">
              {recent.map((article, index) => (
                <li key={article.slug}>
                  <span className="meta block">{String(index + 1).padStart(2, "0")}</span>
                  <Link href={`/writing/${article.slug}`} className="link">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
