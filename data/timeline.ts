import { education } from "./education";
import { experience } from "./experience";

export interface TimelineNode {
  id: string;
  kind: "trunk" | "branch";
  title: string;
  org: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
  branchFrom?: string;
  mergeInto?: string;
}

export const timelineNodes: TimelineNode[] = [
  {
    id: "nsit",
    kind: "trunk",
    title: education[1].degree,
    org: education[1].org,
    location: education[1].location,
    start: education[1].start,
    end: education[1].end,
    highlights: education[1].highlights,
  },
  {
    id: "vanderbilt",
    kind: "branch",
    title: experience[2].role,
    org: experience[2].org,
    location: experience[2].location,
    start: experience[2].start,
    end: experience[2].end,
    highlights: experience[2].highlights,
    branchFrom: "nsit",
    mergeInto: "nsit",
  },
  {
    id: "fast-retailing",
    kind: "trunk",
    title: experience[0].role,
    org: experience[0].org,
    location: experience[0].location,
    start: experience[0].start,
    end: experience[0].end,
    highlights: experience[0].highlights,
  },
  {
    id: "usc",
    kind: "branch",
    title: experience[1].role,
    org: experience[1].org,
    location: experience[1].location,
    start: experience[1].start,
    end: experience[1].end,
    highlights: experience[1].highlights,
    branchFrom: "fast-retailing",
    mergeInto: "fast-retailing",
  },
  {
    id: "cmu",
    kind: "trunk",
    title: education[0].degree,
    org: education[0].org,
    location: education[0].location,
    start: education[0].start,
    end: education[0].end,
    highlights: education[0].highlights,
  },
];
