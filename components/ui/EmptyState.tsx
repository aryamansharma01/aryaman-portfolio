import type { ReactNode } from "react";
import { Hammer } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-accent-cyan">
        {icon ?? <Hammer size={20} />}
      </div>
      <h3 className="text-lg font-medium text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
    </div>
  );
}
