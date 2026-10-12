import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import sharp from "sharp";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const publicDirectory = path.join(process.cwd(), "public");

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

type MediaBackground = "light" | "dark";

// Reports whether a local image sits on a flat white or flat near-black canvas, by sampling
// just inside its edges. Photos and anything else return null and are left untouched.
async function detectBackground(src: string): Promise<MediaBackground | null> {
  const file = path.join(
    publicDirectory,
    decodeURIComponent(src.split(/[?#]/)[0]),
  );
  if (
    !src.startsWith("/") ||
    !file.startsWith(publicDirectory) ||
    !fs.existsSync(file)
  ) {
    return null;
  }

  try {
    const { data, info } = await sharp(file)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const { width, height } = info;
    const inset = 3;
    const points = [
      [width >> 1, inset],
      [width >> 1, height - 1 - inset],
      [inset, height >> 1],
      [width - 1 - inset, height >> 1],
    ];
    const samples = points.map(([x, y]) => {
      const offset = (y * width + x) * 4;
      return [...data.subarray(offset, offset + 4)];
    });
    const opaque = samples.every((pixel) => pixel[3] > 250);
    if (opaque && samples.every(([r, g, b]) => Math.min(r, g, b) >= 245))
      return "light";
    if (opaque && samples.every(([r, g, b]) => Math.max(r, g, b) <= 40))
      return "dark";
  } catch {
    // Unreadable or unsupported image: leave it as is.
  }
  return null;
}

// Tags diagrams and videos with data-bg so CSS can blend their canvas into the page
// background in either theme (see `.prose [data-bg]` in globals.css).
function rehypeMediaBackground() {
  return async (tree: HtmlNode) => {
    const pending: Promise<void>[] = [];
    const tag = (node: HtmlNode, src: unknown) => {
      if (typeof src !== "string") return;
      pending.push(
        detectBackground(src).then((background) => {
          if (background)
            node.properties = { ...node.properties, dataBg: background };
        }),
      );
    };
    const visit = (node: HtmlNode) => {
      if (node.tagName === "img") tag(node, node.properties?.src);
      if (node.tagName === "video") tag(node, node.properties?.poster);
      node.children?.forEach(visit);
    };
    visit(tree);
    await Promise.all(pending);
  };
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
    // Posts are first-party, so raw HTML (video, sized images) is kept and parsed into the tree.
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeHeadings(headings))
    .use(rehypeVideo)
    .use(rehypeMediaBackground)
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
