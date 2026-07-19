import { ArrowDown, FileDown } from "lucide-react";
import { OrbBackground } from "./OrbBackground";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { socials } from "@/data/socials";
import { siteConfig } from "@/lib/constants";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <OrbBackground />

      <p className="mb-4 font-mono text-xs tracking-[0.3em] text-accent-cyan uppercase">
        {siteConfig.name}
      </p>

      <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-6xl">
        Machine Learning Engineer.{" "}
        <span className="text-gradient">Ex-Fast Retailing (UNIQLO).</span>
        <br />
        Incoming, Carnegie Mellon MCDS.
      </h1>

      <p className="mt-6 max-w-xl text-muted">
        Building multi-agent AI systems, forecasting pipelines, and neurosymbolic reasoning
        engines — from Tokyo to Pittsburgh.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href={socials.resume}
          download
          className="glow-blue flex items-center gap-2 rounded-full bg-accent-blue px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-105"
        >
          <FileDown size={16} />
          Download Resume
        </a>
        <a
          href="#timeline"
          className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent-cyan"
        >
          View Timeline
          <ArrowDown size={16} />
        </a>
      </div>

      <SocialIcons className="mt-10" />
    </section>
  );
}
