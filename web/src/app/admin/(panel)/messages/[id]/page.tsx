"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetch, jsonBody } from "@/lib/admin/client";
import type { ApiItem, ContactSubmission, SubmissionStatus } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/page-header";
import { StateBox } from "@/components/admin/state-box";
import { STATUS_LABEL, formatDate } from "@/components/admin/submission-utils";

export default function AdminMessagePage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["submissions", id], queryFn: () => adminFetch<ApiItem<ContactSubmission>>(`submissions/${id}`) });
  const setStatus = useMutation({
    mutationFn: (status: SubmissionStatus) => adminFetch(`submissions/${id}`, { method: "PATCH", body: jsonBody({ status }) }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["submissions"] }),
  });
  const router = useRouter();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const remove = useMutation({
    mutationFn: () => adminFetch<void>(`submissions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["submissions", id] });
      void qc.invalidateQueries({ queryKey: ["submissions"] });
      router.push("/admin/messages");
    },
    onError: (e) => setDeleteError(`წაშლა ვერ მოხერხდა: ${(e as Error).message}`),
  });
  const marked = useRef(false);
  const { mutate } = setStatus;
  useEffect(() => {
    if (q.data?.data.status === "new" && !marked.current) {
      marked.current = true;
      mutate("read");
    }
  }, [q.data, mutate]);
  const s = q.data?.data;

  return (
    <>
      <Link href="/admin/messages" className="micro mb-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3" aria-hidden="true" /> შეტყობინებები
      </Link>
      {q.isLoading ? <StateBox kind="loading" /> : null}
      {q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {s ? (
        <>
          <PageHeader label={`${formatDate(s.created_at)} · ${s.locale.toUpperCase()}`} title={s.subject || "უთემო"} />
          <dl className="grid max-w-3xl gap-px bg-border sm:grid-cols-3" data-testid="admin-submission">
            {[
              ["სახელი", s.name],
              ["ელ-ფოსტა", s.email],
              ["ტელეფონი", s.phone || "—"],
              ["თემა", s.subject || "—"],
              ["ენა", s.locale.toUpperCase()],
              ["სტატუსი განახლდა", formatDate(s.updated_at)],
            ].map(([k, v]) => (
              <div key={k} className="bg-white p-4">
                <dt className="micro text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-semibold break-words">{k === "ელ-ფოსტა" ? <a href={`mailto:${v}`}>{v}</a> : v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 max-w-3xl whitespace-pre-wrap bg-white p-6 leading-relaxed">{s.message}</p>
          <dl className="mt-6 grid max-w-3xl gap-px bg-border text-xs" data-testid="admin-submission-meta">
            {[
              ["IP", s.ip || "—"],
              ["User-Agent", s.user_agent || "—"],
            ].map(([k, v]) => (
              <div key={k} className="bg-white p-3">
                <dt className="micro text-muted-foreground">{k}</dt>
                <dd className="mt-1 break-all font-mono text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="micro text-muted-foreground">სტატუსი: {STATUS_LABEL[setStatus.variables ?? s.status]}</span>
            {(["read", "archived", "new"] as const).map((st) => (
              <Button key={st} type="button" variant="outline" className="rounded-none" onClick={() => setStatus.mutate(st)} data-testid={`admin-status-${st}`}>
                {STATUS_LABEL[st]}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              className="ml-auto rounded-none text-destructive"
              data-testid="admin-submission-delete"
              disabled={remove.isPending}
              onClick={() => {
                setDeleteError(null);
                if (window.confirm("წავშალოთ შეტყობინება? ამის დაბრუნება შეუძლებელია.")) remove.mutate();
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" /> წაშლა
            </Button>
          </div>
          {deleteError ? <p className="mt-3 text-sm text-destructive" role="alert">{deleteError}</p> : null}
        </>
      ) : null}
    </>
  );
}
