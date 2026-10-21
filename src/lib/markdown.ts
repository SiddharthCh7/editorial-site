import GithubSlugger from "github-slugger";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

export type Heading = {
  id: string;
  text: string;
  level: number;
};

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * External links open in a new tab with a safe rel. Internal links are left
 * alone so they participate in client-side navigation.
 */
function rehypeExternalLinks() {
  return (tree: HastNode) => {
    visit(tree, "element", (node: HastNode) => {
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string" || !isExternal(href)) return;
      node.properties = {
        ...node.properties,
        target: "_blank",
        rel: "noreferrer noopener",
        className: ["external-link"],
      };
    });
  };
}

/**
 * `![alt](/diagram.svg "Figure 2 - caption")` becomes a real <figure> with a
 * numbered caption. Images without a title stay plain images.
 */
function rehypeFigures() {
  return (tree: HastNode) => {
    // A captioned image is always authored as a paragraph containing only the
    // image, so we replace that paragraph rather than nesting a figure in a p.
    visit(tree, "element", (node: HastNode, index, parent) => {
      if (node.tagName !== "p" || !parent || index === undefined) return;
      const children = node.children ?? [];
      if (children.length !== 1) return;
      const image = children[0];
      if (image.tagName !== "img") return;

      const title = image.properties?.title;
      if (typeof title !== "string" || title.length === 0) return;

      const cleanImage: HastNode = {
        ...image,
        properties: { ...image.properties },
      };
      delete cleanImage.properties?.title;

      const parentNode = parent as unknown as HastNode;
      if (!parentNode.children) return;
      parentNode.children[index] = {
        type: "element",
        tagName: "figure",
        properties: { className: ["figure"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["figure-frame"] },
            children: [cleanImage],
          },
          {
            type: "element",
            tagName: "figcaption",
            properties: { className: ["figure-caption"] },
            children: [{ type: "text", value: title }],
          },
        ],
      };
    });
  };
}

/** Wide tables scroll inside their own container instead of the page. */
function rehypeTableWrapper() {
  return (tree: HastNode) => {
    visit(tree, "element", (node: HastNode, index, parent) => {
      if (node.tagName !== "table") return;
      if (!parent || index === undefined) return;
      const parentNode = parent as unknown as HastNode;
      if (!parentNode.children) return;
      parentNode.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-scroll"] },
        children: [node],
      };
    });
  };
}

/**
 * GitHub-style admonitions inside blockquotes:
 *
 *   > [!NOTE]
 *   > The body of the note.
 *
 * They render as a labelled callout rather than a pull quote, which keeps the
 * two visually distinct.
 */
function rehypeCallouts() {
  return (tree: HastNode) => {
    visit(tree, "element", (node: HastNode, index, parent) => {
      if (node.tagName !== "blockquote" || !parent || index === undefined) return;
      // Blockquotes begin with a whitespace text node, so find the paragraph.
      const first = (node.children ?? []).find(
        (child) => child.type === "element" && child.tagName === "p",
      );
      if (!first) return;
      const lead = (first.children ?? []).find((child) => child.type === "text");
      if (!lead || typeof lead.value !== "string") return;

      const match = /^\[!(NOTE|WARNING|CAUTION)\]\s*/i.exec(lead.value);
      if (!match) return;

      const kind = match[1].toUpperCase();
      const label = { NOTE: "Note", WARNING: "Warning", CAUTION: "Caution" }[
        kind as "NOTE" | "WARNING" | "CAUTION"
      ];
      lead.value = lead.value.slice(match[0].length);

      const parentNode = parent as unknown as HastNode;
      parentNode.children![index] = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["callout", kind === "NOTE" ? "callout-note" : "callout-warning"],
        },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { className: ["callout-label"] },
            children: [{ type: "text", value: label }],
          },
          {
            type: "element",
            tagName: "div",
            properties: { className: ["callout-body"] },
            children: node.children ?? [],
          },
        ],
      };
    });
  };
}

/** Adds a language label hook the client enhancer can read for the copy bar. */
function rehypeCodeMeta() {
  return (tree: HastNode) => {
    visit(tree, "element", (node: HastNode) => {
      if (node.tagName !== "pre") return;
      const code = node.children?.find((child) => child.tagName === "code");
      if (!code) return;
      const className = code.properties?.className;
      const classes = Array.isArray(className) ? className.map(String) : [];
      const language = classes.find((name) => name.startsWith("language-"));
      node.properties = {
        ...node.properties,
        "data-language": language ? language.replace("language-", "") : "text",
      };
    });
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeSlug)
  .use(rehypeAutolinkHeadings, {
    behavior: "append",
    properties: {
      className: ["heading-anchor"],
      ariaHidden: "true",
      tabIndex: -1,
    },
    content: {
      type: "element",
      tagName: "span",
      properties: { className: ["heading-anchor-mark"] },
      children: [{ type: "text", value: "#" }],
    },
  })
  .use(rehypeExternalLinks)
  .use(rehypeFigures)
  .use(rehypeTableWrapper)
  .use(rehypeCallouts)
  .use(rehypeCodeMeta)
  .use(rehypeHighlight, { detect: false, ignoreMissing: true })
  .use(rehypeKatex)
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown);
  return String(file);
}

/**
 * Headings are extracted from the same source the renderer sees, slugged with
 * the same library rehype-slug uses, so table-of-contents links always resolve.
 */
export function extractHeadings(markdown: string, maxLevel = 3): Heading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];

  visit(tree, "heading", (node) => {
    const text = node.children.map((child) => collectText(child)).join("").trim();
    const id = slugger.slug(text);
    if (node.depth >= 2 && node.depth <= maxLevel && text.length > 0) {
      headings.push({ id, text, level: node.depth });
    }
  });

  return headings;
}

function collectText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const candidate = node as { value?: string; children?: unknown[] };
  if (typeof candidate.value === "string") return candidate.value;
  if (Array.isArray(candidate.children)) {
    return candidate.children.map(collectText).join("");
  }
  return "";
}
