import type { ContactPayload } from "./api-types";


export class ContactError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/** Browser-side contact submit. Always same-origin; the Next route proxies to Laravel server-side (no CORS). */
export async function postContact(payload: ContactPayload): Promise<void> {
  const res = await fetch("/api/v1/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
    throw new ContactError(res.status, body.message ?? "Request failed", body.errors);
  }
}
