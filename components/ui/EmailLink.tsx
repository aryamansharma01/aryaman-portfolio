"use client";

import { useState } from "react";
import { socials } from "@/data/socials";

const address = socials.email.replace("mailto:", "");

interface EmailLinkProps {
  className?: string;
  children: React.ReactNode;
  copiedChildren: React.ReactNode;
}

// Copies the address to the clipboard instead of opening a mail app. The mailto
// href stays as a fallback when the clipboard isn't available.
export function EmailLink({ className, children, copiedChildren }: EmailLinkProps) {
  const [copied, setCopied] = useState(false);

  const copy = async (event: React.MouseEvent) => {
    if (!navigator.clipboard) return;
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = socials.email;
    }
  };

  return (
    <a
      href={socials.email}
      onClick={copy}
      aria-label={copied ? "Email address copied" : `Copy email address ${address}`}
      title={copied ? "Copied!" : `Copy ${address}`}
      className={className}
    >
      {copied ? copiedChildren : children}
    </a>
  );
}
