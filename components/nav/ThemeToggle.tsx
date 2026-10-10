import { Moon, Sun } from "lucide-react";

// The click is handled by the inline theme script in app/layout.tsx, so the toggle
// works before (and without) hydration. Both icons are rendered and swapped in CSS.
export function ThemeToggle() {
  return (
    <button
      type="button"
      data-theme-toggle
      aria-label="Toggle light and dark theme"
      title="Toggle theme"
      className="-mr-1.5 cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground"
    >
      <Moon size={16} className="dark:hidden" />
      <Sun size={16} className="hidden dark:block" />
    </button>
  );
}
