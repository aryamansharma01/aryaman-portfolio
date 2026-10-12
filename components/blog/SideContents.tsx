"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Heading } from "@/lib/posts";
import { cn } from "@/lib/utils";

interface SideContentsProps {
  headings: Heading[];
  /** id of the post body; the list shows once its top has scrolled out of view. */
  targetId: string;
}

// A heading counts as current once it has scrolled up to just below the reading header.
const ACTIVE_OFFSET = 96;

const subscribeNoop = () => () => {};

// Contents list pinned left of the post on wide screens, highlighting the current section.
export function SideContents({ headings, targetId }: SideContentsProps) {
  // Rendered into <body>: the page's fade-up wrapper is transformed, which would trap `fixed`.
  const container = useSyncExternalStore(
    subscribeNoop,
    () => document.body,
    () => null,
  );
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      setVisible(rect.top < 0 && rect.bottom > window.innerHeight / 2);

      let current: string | null = null;
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= ACTIVE_OFFSET)
          current = heading.id;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings, targetId, container]);

  if (!container || headings.length === 0) return null;

  return createPortal(
    <nav
      aria-label="Table of contents"
      aria-hidden={!visible}
      className={cn(
        "fixed top-28 right-[calc(50%+23rem)] hidden max-h-[calc(100vh-10rem)] w-52 overflow-y-auto transition-[opacity,visibility] duration-300 xl:block",
        visible ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <ol className="space-y-2 text-[13px] leading-snug">
        {headings.map((heading) => {
          const active = heading.id === activeId;
          return (
            <li key={heading.id} className={cn(heading.level === 3 && "pl-3")}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  // Capped at 90% so the enlarged current item still fits the column.
                  "inline-block max-w-[90%] origin-left transition-[color,scale] duration-200",
                  active
                    ? "scale-110 font-medium text-foreground"
                    : "text-muted/60 hover:text-foreground",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>,
    container,
  );
}
