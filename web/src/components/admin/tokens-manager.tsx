"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch, jsonBody } from "@/lib/admin/client";
import { adminOps } from "@/lib/admin/ops-copy";
import type { ApiItem, ApiList } from "@/lib/admin/types";
import { PageHeader } from "./page-header";
import { StateBox } from "./state-box";

type TokenRow = { id: number; name: string; expires_at: string | null; last_used_at: string | null; created_at: string };
type Created = TokenRow & { token: string };

const t = adminOps("ka");

export function TokensManager() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [days, setDays] = useState(90);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState<TokenRow | null>(null);
  const q = useQuery({ queryKey: ["tokens"], queryFn: () => adminFetch<ApiList<TokenRow>>("tokens") });
  const create = useMutation({
    mutationFn: () => adminFetch<ApiItem<Created>>("tokens", { method: "POST", body: jsonBody({ name, expires_in_days: days }) }),
    onSuccess: (res) => {
      setRevealed(res.data.token);
      setName("");
      void qc.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
  const revoke = useMutation({
    mutationFn: (id: number) => adminFetch<void>(`tokens/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      setPending(null);
      void qc.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  return (
    <div data-testid="admin-tokens-page">
      <PageHeader label={t.tokensLabel} title={t.tokensTitle} />
      <form
        className="mb-8 grid max-w-xl gap-4 sm:grid-cols-[1fr_8rem_auto] sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          setCopied(false);
          create.mutate();
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="token-name">{t.tokenName}</Label>
          <Input id="token-name" required value={name} onChange={(event) => setName(event.target.value)} data-testid="admin-token-name" className="rounded-none bg-white" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="token-days">{t.tokenExpires}</Label>
          <Input id="token-days" type="number" min={1} max={365} value={days} onChange={(event) => setDays(Number(event.target.value))} data-testid="admin-token-days" className="rounded-none bg-white" />
        </div>
        <Button type="submit" data-testid="admin-token-create" disabled={create.isPending} className="h-9 rounded-none bg-destructive text-white hover:bg-destructive/90">
          {t.tokenCreate}
        </Button>
      </form>
      {revealed ? (
        <div data-testid="admin-token-reveal" className="mb-8 grid max-w-xl gap-3 border border-primary bg-secondary p-4">
          <p data-testid="admin-token-warning" className="text-sm text-[#3D4A5C]">
            {t.tokenOnce}
          </p>
          <pre data-testid="admin-token-secret" className="overflow-x-auto bg-primary p-3 text-sm break-all whitespace-pre-wrap text-white">
            {revealed}
          </pre>
          <Button
            type="button"
            data-testid="admin-token-copy"
            className="w-fit rounded-none bg-destructive text-white hover:bg-destructive/90"
            onClick={() => {
              void navigator.clipboard.writeText(revealed);
              setCopied(true);
            }}
          >
            {copied ? t.tokenCopied : t.tokenCopy}
          </Button>
        </div>
      ) : null}
      {q.isLoading ? <StateBox kind="loading" /> : null}
      {q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {q.data && q.data.data.length === 0 ? <p data-testid="admin-tokens-empty" className="text-sm text-[#3D4A5C]">{t.tokenEmpty}</p> : null}
      {q.data && q.data.data.length > 0 ? (
        <div className="overflow-x-auto border border-border bg-white">
          <table className="w-full min-w-[36rem] text-left text-sm" data-testid="admin-tokens-table">
            <thead className="text-[#3D4A5C]">
              <tr className="border-b border-border">
                <th className="px-3 py-2 font-medium">{t.tokenName}</th>
                <th className="px-3 py-2 font-medium">{t.colExpires}</th>
                <th className="px-3 py-2 font-medium">{t.colLastUsed}</th>
                <th className="px-3 py-2 font-medium">{t.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {q.data.data.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0" data-testid={`admin-token-row-${row.id}`}>
                  <td className="px-3 py-3">{row.name}</td>
                  <td className="px-3 py-3 text-[#3D4A5C]">{row.expires_at ? new Date(row.expires_at).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-3 text-[#3D4A5C]">{row.last_used_at ? new Date(row.last_used_at).toLocaleString() : "—"}</td>
                  <td className="px-3 py-3">
                    <Button type="button" data-testid={`admin-token-revoke-${row.id}`} className="h-8 rounded-none bg-destructive px-3 text-white hover:bg-destructive/90" onClick={() => setPending(row)}>
                      {t.tokenRevoke}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {pending ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/40 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="revoke-title" data-testid="admin-revoke-dialog" className="w-full max-w-md border border-border bg-background p-6">
            <h2 id="revoke-title" className="text-xl font-black">
              {t.revokeTitle}
            </h2>
            <p className="mt-2 text-sm text-[#3D4A5C]">{t.revokeBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" variant="outline" className="rounded-none" data-testid="admin-revoke-cancel" onClick={() => setPending(null)}>
                {t.cancel}
              </Button>
              <Button type="button" data-testid="admin-revoke-confirm" className="rounded-none bg-destructive text-white hover:bg-destructive/90" onClick={() => revoke.mutate(pending.id)}>
                {t.confirmRevoke}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
