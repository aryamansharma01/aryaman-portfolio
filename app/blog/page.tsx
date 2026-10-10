import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { getAllPostsMeta } from "@/lib/posts";

const description = "Notes on ML systems, agents, and everything in between.";

export const metadata: Metadata = {
  title: "Blog",
  description,
};

export default function BlogPage() {
  const posts = getAllPostsMeta();

  return (
    <>
      <PageHeader title="Blog" description={description} />

      {posts.length === 0 ? (
        <p className="border-t border-border pt-6 text-muted">
          No posts yet — writing is in progress. Check back soon.
        </p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.slug} className="border-t border-border">
              <Link
                href={`/blog/${post.slug}`}
                className="group grid gap-x-6 gap-y-1 py-4 sm:grid-cols-[9.5rem_1fr]"
              >
                <time dateTime={post.date} className="pt-0.5 font-mono text-xs text-muted">
                  {post.date}
                </time>
                <span>
                  <span className="font-medium text-foreground transition-colors group-hover:text-accent">
                    {post.title}
                  </span>
                  {post.excerpt && (
                    <span className="mt-1 block text-sm text-muted">{post.excerpt}</span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
