/**
 * Tiny unit check for storage URL join (mirrors src/lib/admin/storage.ts).
 * Run: node scripts/check-storage-url.mjs
 */
function joinUrl(base, ...parts) {
  const root = base.replace(/\/+$/, "");
  const segs = parts
    .flatMap((p) => String(p).split("/"))
    .map((p) => p.trim())
    .filter(Boolean);
  return segs.length ? `${root}/${segs.join("/")}` : root;
}

function storageUrlFrom(storageBase, apiBase, path) {
  if (!path) return null;
  if (/^(https?:|data:|blob:|\/)/.test(path)) return path;
  const STORAGE_BASE = storageBase?.replace(/\/+$/, "") ?? "";
  const API_BASE = apiBase?.replace(/\/+$/, "") ?? "";
  if (STORAGE_BASE) return joinUrl(STORAGE_BASE, path);
  if (API_BASE) return joinUrl(API_BASE, "storage", path);
  return joinUrl("/api/mock-storage", path);
}

const cases = [
  // STORAGE base with/without trailing slash; path without leading slash
  ["https://api.globalai.ge/storage/", null, "uploads/x.png", "https://api.globalai.ge/storage/uploads/x.png"],
  ["https://api.globalai.ge/storage", null, "uploads/x.png", "https://api.globalai.ge/storage/uploads/x.png"],
  ["https://api.globalai.ge/storage//", null, "uploads/x.png", "https://api.globalai.ge/storage/uploads/x.png"],
  // nested path segments
  ["https://api.globalai.ge/storage/", null, "uploads/a/b.png", "https://api.globalai.ge/storage/uploads/a/b.png"],
  // API fallback with/without trailing slash
  [null, "https://api.globalai.ge/", "uploads/x.png", "https://api.globalai.ge/storage/uploads/x.png"],
  [null, "https://api.globalai.ge", "uploads/x.png", "https://api.globalai.ge/storage/uploads/x.png"],
  [null, "https://api.globalai.ge/", "uploads/a/b.png", "https://api.globalai.ge/storage/uploads/a/b.png"],
  // absolute / data / root-relative passthrough
  ["https://api.globalai.ge/storage/", null, "https://cdn.example/a.png", "https://cdn.example/a.png"],
  ["https://api.globalai.ge/storage/", null, "/local.png", "/local.png"],
  ["https://api.globalai.ge/storage/", null, "data:image/png;base64,xx", "data:image/png;base64,xx"],
  // mock fallback
  [null, null, "uploads/x.png", "/api/mock-storage/uploads/x.png"],
];

let failed = 0;
for (const [storage, api, path, expected] of cases) {
  const got = storageUrlFrom(storage, api, path);
  const hostDoubleSlash = /https?:\/\/[^/]+\/\//.test(got ?? "");
  const ok = got === expected && !hostDoubleSlash;
  if (!ok) {
    failed++;
    console.error("FAIL storageUrl", { storage, api, path, expected, got, hostDoubleSlash });
  } else {
    console.log("ok ", got);
  }
}

const joinCases = [
  [["https://a.example/storage/", "uploads/x.png"], "https://a.example/storage/uploads/x.png"],
  [["https://a.example/storage", "uploads/x.png"], "https://a.example/storage/uploads/x.png"],
  [["https://a.example/storage/", "/uploads/x.png"], "https://a.example/storage/uploads/x.png"],
  [["https://a.example/storage", "/uploads/x.png"], "https://a.example/storage/uploads/x.png"],
  [["https://a.example/storage//", "//uploads//x.png"], "https://a.example/storage/uploads/x.png"],
  [["https://a.example/", "storage", "uploads/x.png"], "https://a.example/storage/uploads/x.png"],
  [["https://a.example", "storage/", "/uploads/x.png"], "https://a.example/storage/uploads/x.png"],
  [["https://a.example", "storage", "/uploads/x.png"], "https://a.example/storage/uploads/x.png"],
];
for (const [args, expected] of joinCases) {
  const got = joinUrl(...args);
  if (got !== expected || /https?:\/\/[^/]+\/\//.test(got)) {
    failed++;
    console.error("FAIL joinUrl", { args, expected, got });
  } else {
    console.log("ok ", got);
  }
}

if (failed) {
  console.error(`\n${failed} failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length + joinCases.length} checks passed`);
