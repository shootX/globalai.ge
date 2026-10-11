import { NextResponse } from "next/server";
import { isMock } from "@/lib/admin/server";
import { store } from "@/lib/admin/mock-store";

/** Mock storage disk for uploads (only while NEXT_PUBLIC_API_URL is unset). */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (!isMock) return new NextResponse(null, { status: 404 });
  const { path } = await params;
  const f = store.files.get(path.join("/"));
  if (!f) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(f.bytes), { headers: { "Content-Type": f.type, "Cache-Control": "private, max-age=3600" } });
}
