"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/admin/client";
import { ACTION_LABEL, adminOps } from "@/lib/admin/ops-copy";
import { PageHeader } from "./page-header";
import { StateBox } from "./state-box";

type AuditRow = {
  id: number;
  user_id: number | null;
  user: { id: number; name: string } | null;
  action: string;
  model: string | null;
  model_type: string | null;
  model_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
};

type Page = { data: AuditRow[]; meta: { total: number } };

const t = adminOps("ka");
const actions = ACTION_LABEL.ka;

function lines(value: Record<string, unknown> | null): string[] {
  if (!value) return [];
  return Object.entries(value).map(([key, item]) => `${key}: ${typeof item === "string" ? item : JSON.stringify(item)}`);
}

export function AuditLogView() {
  const [userId, setUserId] = useState("");
  const [modelType, setModelType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const query = new URLSearchParams();
  if (userId) query.set("user_id", userId);
  if (modelType) query.set("model_type", modelType);
  if (from) query.set("from", from);
  if (to) query.set("to", to);
  const q = useQuery({
    queryKey: ["audit-logs", userId, modelType, from, to],
    queryFn: () => adminFetch<Page>(`audit-logs?${query.toString()}`),
  });
  const removed = lines(selected?.old_values ?? null);
  const added = lines(selected?.new_values ?? null);

  return (
    <div data-testid="admin-audit-page">
      <PageHeader label={t.auditLabel} title={t.auditTitle} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-2">
          <Label htmlFor="audit-user">{t.filterUser}</Label>
          <Input id="audit-user" value={userId} onChange={(event) => setUserId(event.target.value)} data-testid="admin-audit-user" className="rounded-none bg-white" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="audit-type">{t.filterType}</Label>
          <Input id="audit-type" value={modelType} onChange={(event) => setModelType(event.target.value)} data-testid="admin-audit-type" className="rounded-none bg-white" placeholder={t.filterAll} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="audit-from">{t.filterFrom}</Label>
          <Input id="audit-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} data-testid="admin-audit-from" className="rounded-none bg-white" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="audit-to">{t.filterTo}</Label>
          <Input id="audit-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} data-testid="admin-audit-to" className="rounded-none bg-white" />
        </div>
      </div>
      {q.isLoading ? <StateBox kind="loading" /> : null}
      {q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {q.data && q.data.data.length === 0 ? <p data-testid="admin-audit-empty" className="text-sm text-[#3D4A5C]">{t.auditEmpty}</p> : null}
      {q.data && q.data.data.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="overflow-x-auto border border-border bg-white">
            <table className="w-full min-w-[36rem] text-left text-sm" data-testid="admin-audit-table">
              <thead className="text-[#3D4A5C]">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 font-medium">{t.colTime}</th>
                  <th className="px-3 py-2 font-medium">{t.colUser}</th>
                  <th className="px-3 py-2 font-medium">{t.colAction}</th>
                  <th className="px-3 py-2 font-medium">{t.colRecord}</th>
                </tr>
              </thead>
              <tbody>
                {q.data.data.map((row) => (
                  <tr key={row.id} data-testid={`admin-audit-row-${row.id}`} className="cursor-pointer border-b border-border last:border-0" onClick={() => setSelected(row)}>
                    <td className="px-3 py-3">{new Date(row.created_at).toLocaleString()}</td>
                    <td className="px-3 py-3">{row.user?.name ?? "—"}</td>
                    <td className="px-3 py-3">{actions[row.action] ?? row.action}</td>
                    <td className="px-3 py-3 text-[#3D4A5C]">{[row.model, row.model_id].filter(Boolean).join(" #") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside data-testid="admin-audit-diff" className="border border-border bg-white p-4">
            <h2 className="text-lg font-black">{t.diffTitle}</h2>
            {!selected ? <p className="mt-3 text-sm text-[#3D4A5C]">{t.diffEmpty}</p> : null}
            {selected ? (
              <div className="mt-3 grid gap-2 text-sm">
                {removed.map((line) => (
                  <p key={`old-${line}`} data-testid="admin-diff-removed" className="bg-[rgba(200,41,11,0.12)] px-2 py-1 text-[#3D4A5C]">
                    <span className="micro text-destructive">{t.diffRemoved}</span> {line}
                  </p>
                ))}
                {added.map((line) => (
                  <p key={`new-${line}`} data-testid="admin-diff-added" className="bg-[rgba(22,120,70,0.12)] px-2 py-1 text-[#3D4A5C]">
                    <span className="micro text-[#167846]">{t.diffAdded}</span> {line}
                  </p>
                ))}
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
