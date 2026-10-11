"use client";

import type { UploadResult } from "./types";

export class AdminApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/** All admin calls go through the Next BFF (/api/v1/admin/*), which attaches the httpOnly Sanctum token. */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isForm = init.body instanceof FormData;
  const res = await fetch(`/api/v1/admin/${path}`, {
    ...init,
    credentials: "same-origin",
    headers: { Accept: "application/json", ...(isForm || !init.body ? {} : { "Content-Type": "application/json" }), ...init.headers },
  });
  if (res.status === 401) {
    // Hard redirect on purpose: session expired, drop all client state (helper is outside React).
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/admin/login?next=${encodeURIComponent(window.location.pathname)}`;
    throw new AdminApiError(401, "Unauthenticated.");
  }
  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string[]> };
  if (!res.ok) throw new AdminApiError(res.status, body.message ?? `HTTP ${res.status}`, body.errors);
  return body as T;
}

export const jsonBody = (value: unknown) => JSON.stringify(value);

export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);
  const res = await adminFetch<{ data: UploadResult }>("uploads", { method: "POST", body: form });
  freshUploads.add(res.data.path);
  return res.data;
}

/** Paths uploaded in this browser session and not yet saved into any record. */
export const freshUploads = new Set<string>();

/** DELETE /api/v1/admin/uploads?path=… — 204 ok, 404 = already gone; 422 (invalid path) throws. */
export async function deleteUpload(path: string): Promise<void> {
  try {
    await adminFetch<void>(`uploads?path=${encodeURIComponent(path)}`, { method: "DELETE" });
  } catch (e) {
    if (e instanceof AdminApiError && e.status === 404) return;
    throw e;
  }
  freshUploads.delete(path);
}

/** Collect image paths of image/gallery fields from a record. */
export function imagePaths(fields: { kind: string; name: string }[], values: Record<string, unknown> | undefined | null): string[] {
  if (!values) return [];
  const out: string[] = [];
  for (const f of fields) {
    const v = values[f.name];
    if (f.kind === "image" && typeof v === "string" && v) out.push(v);
    if (f.kind === "gallery" && Array.isArray(v)) out.push(...v.filter((x): x is string => typeof x === "string" && !!x));
  }
  return out;
}

/** After a successful save: delete files that were in the previous saved record but are gone now. Returns error message or null. */
export async function cleanupRemovedImages(before: string[], after: string[]): Promise<string | null> {
  after.forEach((p) => freshUploads.delete(p));
  const gone = [...new Set(before)].filter((p) => !after.includes(p) && !/^https?:\/\//.test(p));
  const errors: string[] = [];
  for (const p of gone) {
    try {
      await deleteUpload(p);
    } catch (e) {
      errors.push(`${p}: ${(e as Error).message}`);
    }
  }
  return errors.length ? `ფაილის წაშლა ვერ მოხერხდა — ${errors.join("; ")}` : null;
}
