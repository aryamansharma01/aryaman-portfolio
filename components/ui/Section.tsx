import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Section({ id, eyebrow, title, description, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("mx-auto w-full max-w-5xl scroll-mt-24 px-6 py-20", className)}>
      <div className="mb-10">
        {eyebrow ? (
          <p className="mb-2 font-mono text-xs tracking-widest text-accent-cyan uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
