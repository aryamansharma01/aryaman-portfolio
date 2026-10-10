import Image from "next/image";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { about } from "@/data/about";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { siteConfig } from "@/lib/constants";
import { formatDateRange } from "@/lib/utils";

const linkPattern = new RegExp(
  `(${Object.keys(about.links)
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})`,
);

function linkify(paragraph: string) {
  return paragraph.split(linkPattern).map((part, index) =>
    part in about.links ? (
      <a
        key={index}
        href={about.links[part]}
        target="_blank"
        rel="noreferrer"
        className="text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent"
      >
        {part}
      </a>
    ) : (
      part
    ),
  );
}

interface EntryProps {
  start: string;
  end: string;
  title: string;
  org: string;
  location: string;
  highlights: string[];
}

function Entry({ start, end, title, org, location, highlights }: EntryProps) {
  return (
    <li className="grid gap-x-6 gap-y-1 border-t border-border py-6 sm:grid-cols-[9.5rem_1fr]">
      <p className="pt-0.5 font-mono text-xs text-muted">{formatDateRange(start, end, true)}</p>
      <div>
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted">
          {org} · {location}
        </p>
        {highlights.length > 0 && (
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted marker:text-border">
            {highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export default function Home() {
  return (
    <>
      <div className="flex items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            {siteConfig.name}
          </h1>
          <SocialIcons className="mt-5" />
        </div>
        <Image
          src="/aryaman.jpg"
          alt={siteConfig.name}
          width={1206}
          height={1539}
          sizes="144px"
          preload
          className="h-28 w-28 shrink-0 rounded-2xl border border-border object-cover object-[55%_28%] sm:h-36 sm:w-36"
        />
      </div>

      <div className="mt-10 space-y-5 font-serif text-lg leading-relaxed text-foreground">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{linkify(paragraph)}</p>
        ))}
      </div>

      <section className="mt-16">
        <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">Education</h2>
        <ul>
          {education.map((entry) => (
            <Entry key={entry.id} title={entry.degree} {...entry} />
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">Experience</h2>
        <ul>
          {experience.map((entry) => (
            <Entry key={entry.id} title={entry.role} {...entry} />
          ))}
        </ul>
      </section>
    </>
  );
}
