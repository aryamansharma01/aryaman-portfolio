export default function Template({ children }: { children: React.ReactNode }) {
  // The background gives blended post media (see `.prose [data-bg]`) a backdrop: the fade-up
  // animation isolates this subtree, so the body's own background is out of reach.
  return (
    <div className="fade-up bg-background transition-colors duration-[250ms]">
      {children}
    </div>
  );
}
