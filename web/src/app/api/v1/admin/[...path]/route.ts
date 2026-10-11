import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { API_BASE, isMock, readToken, unauthorized } from "@/lib/admin/server";
import { COLLECTIONS, nextId, store, type CollectionName } from "@/lib/admin/mock-store";

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(request: Request, path: string[], token: string) {
  const url = new URL(request.url);
  const target = `${API_BASE}/api/v1/admin/${path.map(encodeURIComponent).join("/")}${url.search}`;
  // Always ask Laravel for Georgian validation errors (ignore browser Accept-Language).
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": "ka",
    Authorization: `Bearer ${token}`,
  };
  const ct = request.headers.get("content-type");
  if (ct) headers["Content-Type"] = ct;
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const res = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
  });
  // Saved page blocks must show on public pages: bust the ISR "pages" tag.
  if (hasBody && res.ok && path[0] === "pages") revalidateTag("pages", { expire: 0 });
  return new NextResponse(res.body, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("content-type") ?? "application/json" },
  });
}

const list = <T,>(data: T[]) => NextResponse.json({ data, meta: { total: data.length } });
const item = <T,>(data: T, status = 200) => NextResponse.json({ data }, { status });
const notFound = () => NextResponse.json({ message: "Not found" }, { status: 404 });

async function mock(request: Request, path: string[]) {
  const [resource, id] = path;
  const method = request.method;

  if (resource === "me" && method === "GET") return item({ name: "Admin (mock)", email: "admin@globalai.ge" });

  if (resource === "uploads" && method === "POST") {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ message: "file required" }, { status: 422 });
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "invalid", errors: { file: ["jpg/png/webp/gif, max 5 MB"] } }, { status: 422 });
    }
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const filePath = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    store.files.set(filePath, { type: file.type, bytes: Buffer.from(await file.arrayBuffer()) });
    return item({ path: filePath, url: `/api/mock-storage/${filePath}` }, 201);
  }

  if (resource === "uploads" && !id && method === "DELETE") {
    const p = new URL(request.url).searchParams.get("path") ?? "";
    // Mirror backend: path must stay inside uploads/ on the public disk.
    if (!/^uploads\/[A-Za-z0-9._-]+$/.test(p) || p.includes(".."))
      return NextResponse.json({ message: "invalid", errors: { path: ["invalid path"] } }, { status: 422 });
    if (!store.files.delete(p)) return notFound();
    return new NextResponse(null, { status: 204 });
  }

  if (resource === "settings") {
    if (method === "GET") return item(store.settings);
    if (method === "PUT" || method === "PATCH") {
      store.settings = { ...store.settings, ...(await request.json()) };
      return item(store.settings);
    }
  }

  if (resource === "pages") {
    if (!id && method === "GET") return list(store.pages);
    if (!id && method === "POST") {
      const body = (await request.json()) as (typeof store.pages)[number];
      store.pages.push(body);
      return item(body, 201);
    }
    const idx = store.pages.findIndex((p) => p.key === id);
    if (method === "PUT") {
      const body = (await request.json()) as (typeof store.pages)[number];
      const next = { ...(idx >= 0 ? store.pages[idx] : {}), ...body, key: id } as (typeof store.pages)[number];
      if (idx >= 0) store.pages[idx] = next;
      else store.pages.push(next);
      return item(next);
    }
    if (idx < 0) return notFound();
    if (method === "GET") return item(store.pages[idx]);
    if (method === "DELETE") {
      store.pages.splice(idx, 1);
      return new NextResponse(null, { status: 204 });
    }
  }

  if ((COLLECTIONS as string[]).includes(resource)) {
    const rows = store[resource as CollectionName] as { id: number; sort_order?: number }[];
    if (!id) {
      if (method === "GET" && resource === "submissions")
        return list([...(rows as { id: number; created_at?: string }[])].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? "")));
      if (method === "GET") return list([...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || b.id - a.id));
      if (method === "POST") {
        const row = { ...(await request.json()), id: nextId() };
        rows.push(row);
        return item(row, 201);
      }
    }
    const idx = rows.findIndex((r) => String(r.id) === id);
    if (idx < 0) return notFound();
    if (method === "GET") return item(rows[idx]);
    if ((method === "PUT" || method === "PATCH") && resource === "submissions") {
      const { status } = (await request.json()) as { status?: string };
      if (!status || !["new", "read", "archived"].includes(status))
        return NextResponse.json({ message: "invalid", errors: { status: ["new|read|archived"] } }, { status: 422 });
      rows[idx] = { ...rows[idx], status, updated_at: new Date().toISOString() } as (typeof rows)[number];
      return item(rows[idx]);
    }
    if (method === "PUT" || method === "PATCH") {
      rows[idx] = { ...rows[idx], ...(await request.json()), id: rows[idx].id };
      return item(rows[idx]);
    }
    if (method === "DELETE") {
      rows.splice(idx, 1);
      return new NextResponse(null, { status: 204 });
    }
  }
  return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
}

async function handle(request: Request, ctx: Ctx) {
  const token = readToken(request);
  if (!token) return unauthorized();
  const { path } = await ctx.params;
  if (!isMock) return proxy(request, path, token);
  if (!store.tokens.has(token)) return unauthorized();
  return mock(request, path);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
