"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "about" },
  { href: "/blog", label: "blog" },
  { href: "/publications", label: "publications" },
  { href: "/projects", label: "projects" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-8 sm:pt-12">
      <Link
        href="/"
        className="font-serif text-2xl font-medium tracking-tight text-foreground transition-colors hover:text-accent"
      >
        aryaman
      </Link>

      <nav className="flex items-center gap-4 text-sm sm:gap-5">
        {links.map((link) => {
          const active =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "link-underline pb-0.5",
                active ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          );
        })}
        <ThemeToggle />
      </nav>
    </header>
  );
}
