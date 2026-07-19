import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, NotebookPen } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { BlogList } from "@/components/blog/BlogList";
import { getAllPostsMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog — Aryaman Sharma",
  description: "Notes on ML systems, agents, and everything in between.",
};

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <div className="mx-auto min-h-[70vh] max-w-4xl px-6 py-20">
      <Link
        href="/#blog"
        className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-accent-cyan"
      >
        <ArrowLeft size={14} />
        Back home
      </Link>
      <h1 className="text-3xl font-semibold text-foreground">Blog</h1>
      <p className="mt-2 text-muted">Notes on ML systems, agents, and everything in between.</p>

      <div className="mt-10">
        {posts.length === 0 ? (
          <EmptyState
            icon={<NotebookPen size={20} />}
            title="Under construction"
            description="No posts yet — writing is in progress. Check back soon."
          />
        ) : (
          <BlogList posts={posts} />
        )}
      </div>
    </div>
  );
}
