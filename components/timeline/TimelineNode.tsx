"use client";

import { cn } from "@/lib/utils";
import type { TimelineNode as TimelineNodeData } from "@/data/timeline";

interface TimelineNodeProps {
  node: TimelineNodeData;
  x: number;
  y: number;
  active: boolean;
  onToggle: () => void;
}

export function TimelineNode({ node, x, y, active, onToggle }: TimelineNodeProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={active}
      aria-label={`${node.title} at ${node.org}`}
      style={{ left: x, top: y }}
      className={cn(
        "absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        node.kind === "trunk" ? "border-accent-blue" : "border-accent-cyan",
        active ? "glow-cyan scale-125 bg-accent-cyan" : "bg-background hover:scale-110",
      )}
    />
  );
}
