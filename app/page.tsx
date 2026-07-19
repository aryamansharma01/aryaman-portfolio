import { Hero } from "@/components/hero/Hero";
import { Timeline } from "@/components/timeline/Timeline";
import { Publications } from "@/components/publications/Publications";
import { Projects } from "@/components/projects/Projects";
import { BlogTeaser } from "@/components/blog/BlogTeaser";

export default function Home() {
  return (
    <>
      <Hero />
      <Timeline />
      <Publications />
      <Projects />
      <BlogTeaser />
    </>
  );
}
