"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ReadingProgressProps {
  title: string;
  minutes: number;
  /** id of the element whose scroll progress is tracked. */
  targetId: string;
}

const subscribeNoop = () => () => {};

// Header that slides in once the post title scrolls away, showing time left to read.
export function ReadingProgress({
  title,
  minutes,
  targetId,
}: ReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);
  // Rendered into <body>: the page's fade-up wrapper is transformed, which would trap `fixed`.
  const container = useSyncExternalStore(
    subscribeNoop,
    () => document.body,
    () => null,
  );
  const [visible, setVisible] = useState(false);
  const [minutesLeft, setMinutesLeft] = useState(minutes);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress =
        scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 1;

      if (barRef.current) barRef.current.style.width = `${progress * 100}%`;
      setVisible(rect.top < 0 && scrollable > 0);
      setMinutesLeft(Math.ceil(minutes * (1 - progress)));
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
  }, [minutes, targetId, container]);

  if (!container) return null;

  return createPortal(
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 top-0 z-20 border-b border-border bg-background/90 backdrop-blur transition-transform duration-300",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-6 px-6 py-2.5">
        <p className="truncate font-serif text-base italic text-foreground">
          {title}
        </p>
        <p className="shrink-0 font-mono text-xs text-muted">
          {minutesLeft > 0 ? `${minutesLeft} min left` : "finished"}
        </p>
      </div>
      {/* Droplet: a tail that thickens from left to right into a round head. */}
      <div
        ref={barRef}
        className="absolute bottom-0 left-0 h-[4px] w-0 min-w-[4px] translate-y-1/2"
      >
        <div
          className="absolute inset-y-0 right-[2.5px] left-0 bg-no-repeat"
          style={{
            // A 1px core plus two outer bands that fade in along the length, so the
            // thickness grows as a smooth ramp instead of in whole-pixel steps.
            backgroundImage: [
              "linear-gradient(var(--foreground), var(--foreground))",
              "linear-gradient(to right, transparent, var(--foreground) 50%)",
              "linear-gradient(to right, transparent 50%, var(--foreground))",
            ].join(", "),
            backgroundSize: "100% 1.5px, 100% 2.5px, 100% 4px",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute top-0 right-0 size-[4px] rounded-full bg-foreground" />
      </div>
    </div>,
    container,
  );
}
