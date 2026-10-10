import { EmailLink } from "@/components/ui/EmailLink";
import { socials } from "@/data/socials";
import { siteConfig } from "@/lib/constants";

const links = [
  { href: socials.github, label: "github" },
  { href: socials.linkedin, label: "linkedin" },
  { href: socials.scholar, label: "scholar" },
  { href: socials.resume, label: "resume" },
];

export function Footer() {
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-border py-8 text-sm text-muted">
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              {...(link.href.startsWith("http") && { target: "_blank", rel: "noreferrer" })}
              className="link-underline pb-0.5 hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <EmailLink className="link-underline pb-0.5 hover:text-foreground" copiedChildren="copied!">
            email
          </EmailLink>
        </li>
      </ul>
      <p className="font-mono text-xs">
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </footer>
  );
}
