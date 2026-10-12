import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PostNavCompact, PostNavFooter } from "@/components/blog/PostNav";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { getAdjacentPosts, getAllPostSlugs, getPostBySlug } from "@/lib/posts";
import "katex/dist/katex.min.css";

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const { previous, next } = getAdjacentPosts(slug);

  return (
    <article>
      <ReadingProgress
        title={post.title}
        minutes={post.readingMinutes}
        targetId="post-body"
      />
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft size={14} />
          all posts
        </Link>
        <PostNavCompact previous={previous} next={next} />
      </div>
      <time dateTime={post.date} className="block font-mono text-xs text-muted">
        {post.date}
      </time>
      <h1 className="mt-2 font-serif text-4xl font-medium italic tracking-tight text-foreground">
        {post.title}
      </h1>
      <TableOfContents headings={post.headings} />
      <div
        id="post-body"
        className="prose mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
      <PostNavFooter previous={previous} next={next} />
    </article>
  );
}
