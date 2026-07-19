import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getAllPostSlugs, getPostBySlug } from "@/lib/posts";

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
  return { title: `${post.title} — Aryaman Sharma`, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto min-h-[70vh] max-w-3xl px-6 py-20">
      <Link
        href="/blog"
        className="mb-8 inline-flex items-center gap-2 font-mono text-sm text-muted hover:text-accent-cyan"
      >
        <ArrowLeft size={14} />
        All posts
      </Link>
      <p className="font-mono text-xs text-accent-cyan">{post.date}</p>
      <h1 className="mt-2 text-3xl font-semibold text-foreground">{post.title}</h1>
      <div
        className="prose prose-invert mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
