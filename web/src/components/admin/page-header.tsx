type PageHeaderProps = { label: string; title: string; actions?: React.ReactNode };

export function PageHeader({ label, title, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
      <div>
        <p className="micro text-muted-foreground">{label}</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">
          {title}
          <span className="text-brand">.</span>
        </h1>
      </div>
      {actions}
    </div>
  );
}
