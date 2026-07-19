import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function BlogPostCard({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="glass block rounded-xl p-5 transition-colors hover:border-accent-cyan"
    >
      <p className="font-mono text-xs text-accent-cyan">{post.date}</p>
      <h3 className="mt-1 font-medium text-foreground">{post.title}</h3>
      <p className="mt-2 text-sm text-muted">{post.excerpt}</p>
    </Link>
  );
}
