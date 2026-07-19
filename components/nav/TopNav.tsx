"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileDown } from "lucide-react";
import { socials } from "@/data/socials";
import { cn } from "@/lib/utils";

const links = [
  { href: "#home", label: "Home" },
  { href: "#timeline", label: "Timeline" },
  { href: "#publications", label: "Publications" },
  { href: "#projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
];

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors",
        scrolled ? "glass" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-mono text-sm font-semibold tracking-widest text-foreground">
          AS<span className="text-accent-cyan">.</span>
        </Link>

        <div className="hidden items-center gap-6 font-mono text-sm text-muted sm:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent-cyan"
            >
              {link.label}
            </a>
          ))}
        </div>

        <a
          href={socials.resume}
          download
          className="glass flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent-cyan"
        >
          <FileDown size={14} />
          <span className="hidden sm:inline">Resume</span>
        </a>
      </nav>
    </header>
  );
}
