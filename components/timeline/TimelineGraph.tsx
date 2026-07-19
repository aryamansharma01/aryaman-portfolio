"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { timelineNodes } from "@/data/timeline";
import { computeTimelineLayout } from "@/lib/timeline-layout";
import { TimelineNode } from "./TimelineNode";
import { TimelineCard } from "./TimelineCard";

export function TimelineGraph() {
  const layout = useMemo(() => computeTimelineLayout(timelineNodes), []);
  const [activeId, setActiveId] = useState<string>("cmu");

  const activeNode = timelineNodes.find((node) => node.id === activeId) ?? timelineNodes[0];

  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
      <div className="overflow-x-auto pb-4">
        <div
          className="relative"
          style={{ width: layout.svgWidth, height: layout.svgHeight }}
        >
          <svg
            width={layout.svgWidth}
            height={layout.svgHeight}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <motion.path
              d={layout.trunkPath}
              stroke="var(--accent-blue)"
              strokeWidth={2}
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
            {layout.branches.map((branch) => (
              <motion.path
                key={branch.id}
                d={branch.path}
                stroke="var(--accent-cyan)"
                strokeWidth={2}
                fill="none"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: "easeInOut", delay: 0.3 }}
              />
            ))}
          </svg>

          {timelineNodes.map((node) => {
            const position = layout.nodePositions.get(node.id);
            if (!position) return null;
            return (
              <TimelineNode
                key={node.id}
                node={node}
                x={position.x}
                y={position.y}
                active={activeId === node.id}
                onToggle={() => setActiveId(node.id)}
              />
            );
          })}

          {timelineNodes.map((node) => {
            const position = layout.nodePositions.get(node.id);
            if (!position) return null;
            const labelX = node.kind === "trunk" ? position.x + 16 : position.x + 16;
            return (
              <div
                key={`${node.id}-label`}
                style={{ left: labelX, top: position.y }}
                className="absolute -translate-y-1/2 whitespace-nowrap font-mono text-[11px] text-muted"
              >
                {node.org}
              </div>
            );
          })}
        </div>
      </div>

      <div className="lg:sticky lg:top-28 lg:flex-1">
        <TimelineCard node={activeNode} />
        <p className="mt-3 font-mono text-[11px] text-muted">
          Click a node on the graph to explore each chapter.
        </p>
      </div>
    </div>
  );
}
