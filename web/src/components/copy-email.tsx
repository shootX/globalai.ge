"use client";

import { useState } from "react";

type CopyEmailProps = { email: string; copy: string; copied: string };

export function CopyEmail({ email, copy, copied }: CopyEmailProps) {
  const [done, setDone] = useState(false);
  return (
    <div className="mail">
      <a href={`mailto:${email}`} data-testid="cta-email">
        {email}
      </a>
      <button
        type="button"
        data-testid="copy-email"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(email);
            setDone(true);
            setTimeout(() => setDone(false), 1800);
          } catch {
            // Clipboard blocked: the mailto link still works.
          }
        }}
      >
        <span aria-live="polite">{done ? copied : copy}</span>
      </button>
    </div>
  );
}
