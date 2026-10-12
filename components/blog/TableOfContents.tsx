import type { Heading } from "@/lib/posts";
import { cn } from "@/lib/utils";

export function TableOfContents({ headings }: { headings: Heading[] }) {
  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="mt-8 border-y border-border py-5"
    >
      <p className="font-mono text-xs text-muted">contents</p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && "pl-4")}>
            <a
              href={`#${heading.id}`}
              className="text-muted transition-colors hover:text-accent"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
