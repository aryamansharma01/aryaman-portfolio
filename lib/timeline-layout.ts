import type { TimelineNode } from "@/data/timeline";

export interface LayoutConfig {
  trunkX: number;
  branchX: number;
  topPadding: number;
  bottomPadding: number;
  pixelsPerMonth: number;
  curveHeight: number;
}

export const defaultLayoutConfig: LayoutConfig = {
  trunkX: 56,
  branchX: 200,
  topPadding: 48,
  bottomPadding: 48,
  pixelsPerMonth: 16,
  curveHeight: 36,
};

export const compactLayoutConfig: LayoutConfig = {
  trunkX: 32,
  branchX: 120,
  topPadding: 36,
  bottomPadding: 36,
  pixelsPerMonth: 11,
  curveHeight: 24,
};

function monthsBetween(a: Date, b: Date): number {
  return (
    (b.getFullYear() - a.getFullYear()) * 12 +
    (b.getMonth() - a.getMonth()) +
    (b.getDate() - a.getDate()) / 30
  );
}

export function dateToY(date: Date, minDate: Date, config: LayoutConfig): number {
  return config.topPadding + monthsBetween(minDate, date) * config.pixelsPerMonth;
}

export interface BranchPath {
  id: string;
  path: string;
  nodeX: number;
  nodeY: number;
}

export interface TimelineLayout {
  svgWidth: number;
  svgHeight: number;
  trunkPath: string;
  branches: BranchPath[];
  nodePositions: Map<string, { x: number; y: number }>;
}

export function computeTimelineLayout(
  nodes: TimelineNode[],
  config: LayoutConfig = defaultLayoutConfig,
): TimelineLayout {
  const allDates = nodes.flatMap((node) => [new Date(node.start), new Date(node.end)]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  const trunkTop = config.topPadding;
  const trunkBottom = dateToY(maxDate, minDate, config);
  const svgHeight = trunkBottom + config.bottomPadding;
  const svgWidth = config.branchX + 260;

  const trunkPath = `M ${config.trunkX},${trunkTop} L ${config.trunkX},${trunkBottom}`;

  const nodePositions = new Map<string, { x: number; y: number }>();
  const branches: BranchPath[] = [];

  for (const node of nodes) {
    if (node.kind === "trunk") {
      const y = dateToY(new Date(node.start), minDate, config);
      nodePositions.set(node.id, { x: config.trunkX, y });
      continue;
    }

    const yDiverge = dateToY(new Date(node.start), minDate, config);
    const yMerge = dateToY(new Date(node.end), minDate, config);
    const curveHeight = Math.min(config.curveHeight, Math.max(6, (yMerge - yDiverge) / 2));
    const nodeY = (yDiverge + yMerge) / 2;

    const path = [
      `M ${config.trunkX},${yDiverge}`,
      `C ${config.trunkX},${yDiverge + curveHeight} ${config.branchX},${yDiverge} ${config.branchX},${yDiverge + curveHeight}`,
      `L ${config.branchX},${yMerge - curveHeight}`,
      `C ${config.branchX},${yMerge} ${config.trunkX},${yMerge - curveHeight} ${config.trunkX},${yMerge}`,
    ].join(" ");

    branches.push({ id: node.id, path, nodeX: config.branchX, nodeY });
    nodePositions.set(node.id, { x: config.branchX, y: nodeY });
  }

  return { svgWidth, svgHeight, trunkPath, branches, nodePositions };
}
