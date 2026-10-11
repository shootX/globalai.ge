/**
 * Resolve a stored file `path` (as saved in models) to a displayable URL.
 * Absolute/data/root-relative values pass through. Otherwise:
 * NEXT_PUBLIC_STORAGE_URL + path, else NEXT_PUBLIC_API_URL + /storage/ + path, else local mock storage.
 *
 * Joins always use exactly one slash between base and path (never `//` after the host),
 * regardless of trailing slash on the base or leading slash on the path.
 */

/** Join a base URL with path segments using exactly one `/` between parts. */
export function joinUrl(base: string, ...parts: string[]): string {
  const root = base.replace(/\/+$/, "");
  const segs = parts
    .flatMap((p) => p.split("/"))
    .map((p) => p.trim())
    .filter(Boolean);
  return segs.length ? `${root}/${segs.join("/")}` : root;
}

const STORAGE_BASE = process.env.NEXT_PUBLIC_STORAGE_URL?.replace(/\/+$/, "") ?? "";
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ?? "";

export function storageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^(https?:|data:|blob:|\/)/.test(path)) return path;
  if (STORAGE_BASE) return joinUrl(STORAGE_BASE, path);
  if (API_BASE) return joinUrl(API_BASE, "storage", path);
  return joinUrl("/api/mock-storage", path);
}
