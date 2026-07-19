import type { Project } from "@/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="font-medium text-foreground">{project.title}</h3>
      <p className="mt-2 text-sm text-muted">{project.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-accent-cyan"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
