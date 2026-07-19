import { ExternalLink } from "lucide-react";
import type { Publication } from "@/data/publications";

export function PublicationItem({ publication }: { publication: Publication }) {
  const content = (
    <>
      <div>
        <p className="font-medium text-foreground">{publication.title}</p>
        <p className="mt-1 text-sm text-muted">{publication.venue}</p>
      </div>
      <span className="font-mono text-xs text-accent-cyan">{publication.year}</span>
    </>
  );

  const className =
    "glass flex items-start justify-between gap-4 rounded-xl p-5 transition-colors hover:border-accent-cyan";

  if (publication.link) {
    return (
      <a href={publication.link} target="_blank" rel="noreferrer" className={className}>
        {content}
        <ExternalLink size={14} className="mt-1 text-muted" />
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}
