import { Wrench } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { projects } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

export function Projects() {
  return (
    <Section
      id="projects"
      eyebrow="Build"
      title="Projects"
      description="Independent builds outside of work — coming soon."
    >
      {projects.length === 0 ? (
        <EmptyState
          icon={<Wrench size={20} />}
          title="Under construction"
          description="Project write-ups are on the way. Check back soon, or explore the timeline above in the meantime."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </Section>
  );
}
