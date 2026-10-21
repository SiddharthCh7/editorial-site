import { getAllArticles } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, which RSS 2.0 requires. */
function rfc822(iso: string): string {
  return new Date(`${iso}T09:00:00Z`).toUTCString();
}

export function GET() {
  const articles = getAllArticles();

  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/writing/${article.slug}`);
      const description = `${article.description} (${article.readingTime})`;
      return [
        "    <item>",
        `      <title>${escape(article.title)}</title>`,
        `      <link>${escape(url)}</link>`,
        `      <guid isPermaLink="true">${escape(url)}</guid>`,
        `      <pubDate>${rfc822(article.publishedAt)}</pubDate>`,
        `      <description>${escape(description)}</description>`,
        ...article.tags.map((tag) => `      <category>${escape(tag)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${site.name} - ${site.descriptor}`)}</title>
    <link>${escape(absoluteUrl("/"))}</link>
    <description>${escape(site.description)}</description>
    <language>en</language>
    <atom:link href="${escape(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
