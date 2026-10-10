interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-10">
      <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground">{title}</h1>
      {description && <p className="mt-3 text-muted">{description}</p>}
    </div>
  );
}
