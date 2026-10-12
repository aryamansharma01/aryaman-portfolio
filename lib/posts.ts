import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface Post extends PostMeta {
  contentHtml: string;
  headings: Heading[];
  readingMinutes: number;
}

interface HtmlNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HtmlNode[];
}

const WORDS_PER_MINUTE = 220;

function nodeText(node: HtmlNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(nodeText).join("");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

// Gives h2/h3 headings an id and collects them for the table of contents.
function rehypeHeadings(headings: Heading[]) {
  return () => {
    const seen = new Map<string, number>();
    const visit = (node: HtmlNode) => {
      if (node.tagName === "h2" || node.tagName === "h3") {
        const text = nodeText(node).trim();
        const base = slugify(text) || "section";
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count}`;
        node.properties = { ...node.properties, id };
        headings.push({ id, text, level: node.tagName === "h2" ? 2 : 3 });
      }
      node.children?.forEach(visit);
    };
    return visit;
  };
}

// Lets posts embed a video with image syntax: ![caption](/path/to/clip.mp4)
function rehypeVideo() {
  const visit = (node: HtmlNode) => {
    const src = node.properties?.src;
    if (
      node.tagName === "img" &&
      typeof src === "string" &&
      /\.(mp4|webm)$/.test(src)
    ) {
      node.tagName = "video";
      node.properties = {
        src,
        ariaLabel: node.properties?.alt,
        autoPlay: true,
        loop: true,
        muted: true,
        playsInline: true,
        disablePictureInPicture: true,
      };
    }
    node.children?.forEach(visit);
  };
  return visit;
}

function listMarkdownFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".md"));
}

export function getAllPostSlugs(): string[] {
  return listMarkdownFiles().map((file) => file.replace(/\.md$/, ""));
}

export function getAllPostsMeta(): PostMeta[] {
  const files = listMarkdownFiles();

  const posts = files.map((file) => {
    const slug = file.replace(/\.md$/, "");
    const fullPath = path.join(postsDirectory, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title ?? slug,
      date: data.date ?? "",
      excerpt: data.excerpt ?? "",
    } satisfies PostMeta;
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// Neighbours in publication order: `previous` is the older post, `next` the newer one.
export function getAdjacentPosts(slug: string): {
  previous?: PostMeta;
  next?: PostMeta;
} {
  const posts = getAllPostsMeta();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return {};
  return { previous: posts[index + 1], next: posts[index - 1] };
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const headings: Heading[] = [];
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeHeadings(headings))
    .use(rehypeVideo)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    contentHtml: processed.toString(),
    headings,
    readingMinutes: Math.max(
      1,
      Math.round(content.trim().split(/\s+/).length / WORDS_PER_MINUTE),
    ),
  };
}
