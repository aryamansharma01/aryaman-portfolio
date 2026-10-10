import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { projects } from "@/data/projects";

const description = "Independent builds outside of work.";

export const metadata: Metadata = {
  title: "Projects",
  description,
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader title="Projects" description={description} />

      {projects.length === 0 ? (
        <p className="border-t border-border pt-6 text-muted">
          Project write-ups are on the way. Check back soon.
        </p>
      ) : (
        <ol>
          {projects.map((project, index) => (
            <li
              key={project.id}
              className="grid gap-x-6 gap-y-1 border-t border-border py-6 sm:grid-cols-[4rem_1fr]"
            >
              <p className="pt-0.5 font-mono text-xs text-muted">
                {String(index + 1).padStart(3, "0")}
              </p>
              <div>
                <h2 className="font-serif text-xl font-medium text-foreground">{project.title}</h2>
                {project.stack.length > 0 && (
                  <p className="mt-1 font-mono text-xs text-muted">{project.stack.join(" · ")}</p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="link-underline mt-3 inline-block pb-0.5 text-sm text-accent"
                  >
                    source ↗
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
