type PageHeroProps = { label: string; title: string; intro?: string; testId: string; children?: React.ReactNode };

export function PageHero({ label, title, intro, testId, children }: PageHeroProps) {
  return (
    <header className="wrap page-hero" data-testid={testId}>
      <span className="label">{label}</span>
      <h1>{title}</h1>
      {intro ? <p className="intro">{intro}</p> : null}
      {children ? <div className="extra">{children}</div> : null}
    </header>
  );
}
