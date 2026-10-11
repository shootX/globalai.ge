type PageHeroProps = { label: string; title: string; intro: string; testId: string };

export function PageHero({ label, title, intro, testId }: PageHeroProps) {
  return (
    <div className="wrap ph" data-testid={testId}>
      <div className="blob" aria-hidden="true" style={{ width: 300, height: 300, right: "6%", top: 40 }} />
      <div className="blob" aria-hidden="true" style={{ width: 110, height: 110, right: "30%", top: 220 }} />
      <span className="m" style={{ color: "var(--grey)" }}>
        {label}
      </span>
      <h1>
        {title}
        <em>.</em>
      </h1>
      <p className="intro">{intro}</p>
    </div>
  );
}
