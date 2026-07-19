import type { PostMeta } from "@/lib/posts";
import { BlogPostCard } from "./BlogPostCard";

export function BlogList({ posts }: { posts: PostMeta[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <BlogPostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
