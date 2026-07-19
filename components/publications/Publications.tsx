import { Section } from "@/components/ui/Section";
import { publications } from "@/data/publications";
import { PublicationItem } from "./PublicationItem";

export function Publications() {
  return (
    <Section
      id="publications"
      eyebrow="Research"
      title="Publications"
      description="Peer-reviewed and conference work spanning causal AI, transit equity, and NLP."
    >
      <div className="grid gap-4">
        {publications.map((publication) => (
          <PublicationItem key={publication.id} publication={publication} />
        ))}
      </div>
    </Section>
  );
}
