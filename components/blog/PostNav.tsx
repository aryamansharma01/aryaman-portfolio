import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

interface PostNavProps {
  previous?: PostMeta;
  next?: PostMeta;
}

const linkClass =
  "inline-flex items-center gap-1.5 text-muted transition-colors hover:text-accent";

// Compact pair of links for the top of a post.
export function PostNavCompact({ previous, next }: PostNavProps) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Adjacent posts"
      className="flex items-center gap-4 text-sm"
    >
      {previous && (
        <Link
          href={`/blog/${previous.slug}`}
          title={previous.title}
          className={linkClass}
        >
          <ArrowLeft size={14} />
          previous
        </Link>
      )}
      {next && (
        <Link
          href={`/blog/${next.slug}`}
          title={next.title}
          className={linkClass}
        >
          next
          <ArrowRight size={14} />
        </Link>
      )}
    </nav>
  );
}

// Centered links with post titles for the end of a post.
export function PostNavFooter({ previous, next }: PostNavProps) {
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Adjacent posts"
      className="mt-14 flex flex-wrap justify-center gap-x-12 gap-y-6 border-t border-border pt-8 text-center"
    >
      {previous && (
        <Link href={`/blog/${previous.slug}`} className="group max-w-64">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <ArrowLeft size={12} />
            previous post
          </span>
          <span className="mt-1 block text-sm font-medium text-foreground transition-colors group-hover:text-accent">
            {previous.title}
          </span>
        </Link>
      )}
      {next && (
        <Link href={`/blog/${next.slug}`} className="group max-w-64">
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            next post
            <ArrowRight size={12} />
          </span>
          <span className="mt-1 block text-sm font-medium text-foreground transition-colors group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      )}
    </nav>
  );
}
