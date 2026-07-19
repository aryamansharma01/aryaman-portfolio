import { NotebookPen } from "lucide-react";
import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAllPostsMeta } from "@/lib/posts";
import { BlogList } from "./BlogList";

export function BlogTeaser() {
  const posts = getAllPostsMeta().slice(0, 3);

  return (
    <Section
      id="blog"
      eyebrow="Writing"
      title="Blog"
      description="Notes on ML systems, agents, and everything in between."
    >
      {posts.length === 0 ? (
        <EmptyState
          icon={<NotebookPen size={20} />}
          title="Under construction"
          description="No posts yet — writing is in progress. Check back soon."
        />
      ) : (
        <>
          <BlogList posts={posts} />
          <Link
            href="/blog"
            className="mt-6 inline-block font-mono text-sm text-accent-cyan hover:underline"
          >
            View all posts →
          </Link>
        </>
      )}
    </Section>
  );
}
