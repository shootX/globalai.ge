import { Link } from "@/i18n/navigation";

type CtaBandProps = { title: string; cta: string; testId: string };

export function CtaBand({ title, cta, testId }: CtaBandProps) {
  return (
    <section className="band" data-testid="cta-band">
      <div className="wrap row">
        <h2>{title}</h2>
        <Link className="btn" href="/contact" data-testid={testId}>
          {cta} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
