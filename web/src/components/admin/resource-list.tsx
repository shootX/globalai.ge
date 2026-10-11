"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminFetch } from "@/lib/admin/client";
import { RESOURCES } from "@/lib/admin/resources";
import type { ApiList } from "@/lib/admin/types";
import { PageHeader } from "./page-header";
import { StateBox } from "./state-box";

type Row = Record<string, unknown> & { id: number; is_published?: boolean; sort_order?: number };

export function ResourceList({ resource }: { resource: keyof typeof RESOURCES }) {
  const cfg = RESOURCES[resource];
  const q = useQuery({ queryKey: [cfg.path], queryFn: () => adminFetch<ApiList<Row>>(cfg.path) });

  return (
    <>
      <PageHeader
        label={cfg.label}
        title={cfg.title}
        actions={
          <Button asChild className="rounded-none" data-testid="admin-new">
            <Link href={`${cfg.route}/new`}>
              <Plus className="size-4" aria-hidden="true" /> ახალი {cfg.singular}
            </Link>
          </Button>
        }
      />
      {q.isLoading ? <StateBox kind="loading" /> : null}
      {q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {q.data && q.data.data.length === 0 ? <StateBox kind="empty" /> : null}
      {q.data && q.data.data.length > 0 ? (
        <div className="border border-border bg-white">
          <Table data-testid={`admin-${cfg.path}-table`}>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>სათაური (KA)</TableHead>
                <TableHead className="hidden md:table-cell">დეტალი</TableHead>
                <TableHead>სტატუსი</TableHead>
                <TableHead className="text-right">მოქმედება</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data.data.map((r, i) => (
                <TableRow key={r.id} data-testid={`admin-row-${i}`}>
                  <TableCell className="font-mono">{r.sort_order ?? "—"}</TableCell>
                  <TableCell className="font-semibold">{cfg.primary(r)}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{cfg.secondary?.(r)}</TableCell>
                  <TableCell>
                    {r.is_published ? (
                      <Badge className="rounded-none bg-primary">გამოქვეყნებული</Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-none">დრაფტი</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm" className="rounded-none">
                      <Link href={`${cfg.route}/${r.id}`} data-testid={`admin-edit-${i}`}>
                        რედაქტირება
                      </Link>
                    </Button>
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
