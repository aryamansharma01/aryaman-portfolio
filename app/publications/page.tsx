import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { publications } from "@/data/publications";

const description =
  "Peer-reviewed and conference work spanning causal AI, transit equity, and NLP.";

export const metadata: Metadata = {
  title: "Publications",
  description,
};

export default function PublicationsPage() {
  return (
    <>
      <PageHeader title="Publications" description={description} />

      <ul>
        {publications.map((publication) => (
          <li
            key={publication.id}
            className="grid gap-x-6 gap-y-1 border-t border-border py-5 sm:grid-cols-[4rem_1fr]"
          >
            <p className="pt-0.5 font-mono text-xs text-muted">{publication.year}</p>
            <div>
              {publication.link ? (
                <a
                  href={publication.link}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
                >
                  {publication.title}
                  <ExternalLink size={13} className="ml-1.5 inline align-baseline text-muted" />
                </a>
              ) : (
                <h2 className="font-medium text-foreground">{publication.title}</h2>
              )}
              <p className="mt-1 text-sm text-muted">{publication.venue}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
