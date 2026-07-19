import { Section } from "@/components/ui/Section";
import { TimelineGraph } from "./TimelineGraph";

export function Timeline() {
  return (
    <Section
      id="timeline"
      eyebrow="Journey"
      title="Education & Experience"
      description="A commit history of the last six years — undergrad, internships branching off along the way, a full-time role, and now Carnegie Mellon."
    >
      <TimelineGraph />
    </Section>
  );
}
