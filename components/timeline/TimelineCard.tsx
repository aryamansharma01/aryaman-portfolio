import { formatDateRange } from "@/lib/utils";
import type { TimelineNode as TimelineNodeData } from "@/data/timeline";

export function TimelineCard({ node }: { node: TimelineNodeData }) {
  return (
    <div className="glass w-72 rounded-xl p-4 text-left sm:w-80">
      <p className="font-mono text-[11px] tracking-wide text-accent-cyan">
        {formatDateRange(node.start, node.end, true)}
      </p>
      <h4 className="mt-1 text-sm font-semibold text-foreground">{node.title}</h4>
      <p className="text-xs text-muted">
        {node.org} · {node.location}
      </p>
      <ul className="mt-3 space-y-2">
        {node.highlights.map((highlight) => (
          <li key={highlight} className="text-xs leading-relaxed text-muted">
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}
