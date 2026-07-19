export interface EducationEntry {
  id: string;
  degree: string;
  org: string;
  location: string;
  start: string;
  end: string;
  detail?: string;
  highlights: string[];
}

export const education: EducationEntry[] = [
  {
    id: "cmu",
    degree: "Master of Computational Data Science (MCDS)",
    org: "Carnegie Mellon University",
    location: "Pittsburgh, PA",
    start: "2026-08-01",
    end: "2028-05-31",
    highlights: ["Incoming graduate student"],
  },
  {
    id: "nsit",
    degree: "B.Tech, Computer Engineering",
    org: "Netaji Subhas University of Technology (erstwhile NSIT)",
    location: "Delhi, India",
    start: "2019-08-01",
    end: "2023-05-31",
    detail: "8.70 / 10 CGPA",
    highlights: ["8.70 / 10 CGPA"],
  },
];
