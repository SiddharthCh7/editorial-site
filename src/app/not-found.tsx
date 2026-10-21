import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="shell-medium flex min-h-[60vh] flex-col justify-center py-20">
      <p className="flex items-center gap-3">
        <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
        <span className="eyebrow">404 · Not found</span>
      </p>
      <h1 className="mt-6 max-w-[20ch] font-serif text-[clamp(2.2rem,1.6rem+2.6vw,3.2rem)] leading-[1.03] tracking-[-0.025em]">
        This page was never here, or has been retired.
      </h1>
      <p className="mt-5 max-w-[48ch] text-[0.98rem] leading-relaxed text-secondary">
        Nothing is broken on your end. The address may be mistyped, or the piece
        may have been renamed while the writing was reorganised. The archive is
        the reliable way back in.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link href="/writing" className="btn btn-primary">
          Read the writing
          <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Link>
        <Link
          href="/projects"
          className="text-[0.8125rem] text-secondary transition-colors hover:text-ink"
        >
          Projects
        </Link>
        <Link
          href="/topics"
          className="text-[0.8125rem] text-secondary transition-colors hover:text-ink"
        >
          Topics
        </Link>
      </div>
      <p className="meta mt-14">
        Tip: press <kbd className="border border-rule px-1">⌘K</kbd> anywhere to
        search the whole publication.
      </p>
    </div>
  );
}
