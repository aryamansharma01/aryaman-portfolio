export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  link?: string;
}

export const projects: Project[] = [];
