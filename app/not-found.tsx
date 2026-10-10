import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16">
      <p className="font-mono text-xs text-muted">404</p>
      <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-3 text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="link-underline mt-6 inline-block pb-0.5 text-sm text-accent">
        ← back home
      </Link>
    </div>
  );
}
