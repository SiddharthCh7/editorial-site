/** Types shared between the content loader and client components. */

export type SearchRecord = {
  type: "article" | "project";
  title: string;
  href: string;
  description: string;
  tags: string[];
  date: string;
  readingTime?: string;
};
