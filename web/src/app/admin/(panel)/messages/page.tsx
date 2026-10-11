"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminFetch } from "@/lib/admin/client";
import type { ApiList, ContactSubmission } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/page-header";
import { StateBox } from "@/components/admin/state-box";
import { STATUS_LABEL, formatDate } from "@/components/admin/submission-utils";

export default function AdminMessagesPage() {
  const q = useQuery({ queryKey: ["submissions"], queryFn: () => adminFetch<ApiList<ContactSubmission>>("submissions") });
  return (
    <>
      <PageHeader label={`კონტაქტის ფორმა${q.data ? ` · ${q.data.meta.total}` : ""}`} title="შეტყობინებები" />
      {q.isLoading ? <StateBox kind="loading" /> : null}
      {q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {q.data && q.data.data.length === 0 ? <StateBox kind="empty" /> : null}
      {q.data && q.data.data.length > 0 ? (
        <div className="border border-border bg-white">
          <Table data-testid="admin-submissions-table">
            <TableHeader>
              <TableRow>
                <TableHead>გამომგზავნი</TableHead>
                <TableHead className="hidden md:table-cell">თემა</TableHead>
                <TableHead className="hidden lg:table-cell">ტელეფონი</TableHead>
                <TableHead className="hidden lg:table-cell">ენა</TableHead>
                <TableHead className="hidden md:table-cell">თარიღი</TableHead>
                <TableHead>სტატუსი</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data.data.map((s, i) => (
                <TableRow key={s.id} data-testid={`admin-row-${i}`} className={s.status === "new" ? "font-semibold" : undefined}>
                  <TableCell>
                    <Link href={`/admin/messages/${s.id}`} className="underline-offset-4 hover:underline" data-testid={`admin-open-${i}`}>
                      {s.name}
                    </Link>
                    <div className="text-xs font-normal text-muted-foreground">{s.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{s.subject || "—"}</TableCell>
                  <TableCell className="hidden font-mono text-xs lg:table-cell">{s.phone || "—"}</TableCell>
                  <TableCell className="hidden font-mono text-xs uppercase lg:table-cell">{s.locale}</TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">{formatDate(s.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === "new" ? "default" : "outline"} className={s.status === "new" ? "rounded-none bg-brand-text" : "rounded-none"}>
                      {STATUS_LABEL[s.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}
    </>
  );
}
