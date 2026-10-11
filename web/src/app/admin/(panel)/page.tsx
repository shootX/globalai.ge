"use client";

import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/client";
import type { ApiList, ContactSubmission } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/page-header";

const CARDS = [
  { path: "services", href: "/admin/services", label: "სერვისები" },
  { path: "projects", href: "/admin/projects", label: "პროექტები" },
  { path: "team", href: "/admin/team", label: "გუნდის წევრები" },
  { path: "submissions", href: "/admin/messages", label: "ახალი შეტყობინება" },
] as const;

export default function AdminDashboardPage() {
  const results = useQueries({
    queries: CARDS.map((c) => ({ queryKey: [c.path], queryFn: () => adminFetch<ApiList<Record<string, unknown>>>(c.path) })),
  });
  return (
    <>
      <PageHeader label="globalAI.GE" title="მთავარი" />
      <div className="grid gap-px bg-border sm:grid-cols-2 xl:grid-cols-4" data-testid="admin-dashboard">
        {CARDS.map((c, i) => {
          const d = results[i].data;
          const value =
            c.path === "submissions"
              ? d?.data.filter((s) => (s as ContactSubmission).status === "new").length
              : d?.meta.total;
          return (
            <Link key={c.path} href={c.href} className="bg-white p-8 hover:bg-muted" data-testid={`admin-stat-${c.path}`}>
              <p className="font-mono text-6xl font-bold tracking-tight">{value ?? "—"}</p>
              <p className="micro mt-3 text-muted-foreground">{c.label}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
