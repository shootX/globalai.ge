"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetch, AdminApiError, cleanupRemovedImages, imagePaths, jsonBody } from "@/lib/admin/client";
import { buildSchema, localesWithErrors } from "@/lib/admin/fields";
import { RESOURCES } from "@/lib/admin/resources";
import type { AdminLocale, ApiItem } from "@/lib/admin/types";
import { FormFields } from "./form-fields";
import { LocaleTabs } from "./locale-tabs";
import { PageHeader } from "./page-header";
import { StateBox } from "./state-box";
import { SaveBar, type SaveState } from "./save-bar";

type ResourceEditorProps = { resource: keyof typeof RESOURCES; id: string };

export function ResourceEditor({ resource, id }: ResourceEditorProps) {
  const cfg = RESOURCES[resource];
  const isNew = id === "new";
  const router = useRouter();
  const qc = useQueryClient();
  const [locale, setLocale] = useState<AdminLocale>("ka");
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const schema = useMemo(() => buildSchema(cfg.fields), [cfg.fields]);

  const q = useQuery({
    queryKey: [cfg.path, id],
    queryFn: () => adminFetch<ApiItem<FieldValues>>(`${cfg.path}/${id}`),
    enabled: !isNew,
  });

  const form = useForm<FieldValues>({ resolver: zodResolver(schema) as never, defaultValues: cfg.empty() });
  const { register, control, handleSubmit, reset, formState } = form;
  const savedImages = useRef<string[]>([]);
  useEffect(() => {
    if (q.data) {
      reset({ ...cfg.empty(), ...q.data.data });
      savedImages.current = imagePaths(cfg.fields, q.data.data);
    }
  }, [q.data, reset, cfg]);

  const save = useMutation({
    mutationFn: (values: FieldValues) =>
      adminFetch<ApiItem<FieldValues & { id: number }>>(isNew ? cfg.path : `${cfg.path}/${id}`, {
        method: isNew ? "POST" : "PUT",
        body: jsonBody(values),
      }),
    onSuccess: async (res, values) => {
      const after = imagePaths(cfg.fields, (res?.data as FieldValues | undefined) ?? values);
      const cleanupError = await cleanupRemovedImages(savedImages.current, after);
      savedImages.current = after;
      void qc.invalidateQueries({ queryKey: [cfg.path] });
      setSaveState(cleanupError ? { kind: "error", message: cleanupError } : { kind: "saved" });
      if (isNew && res?.data?.id) router.replace(`${cfg.route}/${res.data.id}`);
    },
    onError: (e) => {
      if (e instanceof AdminApiError && e.errors) {
        for (const [k, msgs] of Object.entries(e.errors)) form.setError(k as never, { message: msgs[0] });
      }
      setSaveState({ kind: "error", message: (e as Error).message });
    },
  });

  const remove = useMutation({
    mutationFn: () => adminFetch<void>(`${cfg.path}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [cfg.path] });
      router.push(cfg.route);
    },
  });

  const watched = useWatch({ control }) as Record<string, unknown>;
  const errored = localesWithErrors(formState.errors as Record<string, unknown>);

  return (
    <>
      <Link href={cfg.route} className="micro mb-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3" aria-hidden="true" /> {cfg.title}
      </Link>
      <PageHeader
        label={isNew ? "ახალი ჩანაწერი" : `ID ${id}`}
        title={isNew ? `ახალი ${cfg.singular}` : cfg.primary(watched)}
        actions={
          !isNew ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-none text-destructive"
              data-testid="admin-delete"
              onClick={() => {
                if (window.confirm("წავშალოთ ჩანაწერი?")) remove.mutate();
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" /> წაშლა
            </Button>
          ) : null
        }
      />
      {!isNew && q.isLoading ? <StateBox kind="loading" /> : null}
      {!isNew && q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {isNew || q.data ? (
        <form
          data-testid={`admin-${cfg.path}-form`}
          noValidate
          onSubmit={handleSubmit(
            (v) => {
              setSaveState({ kind: "saving" });
              save.mutate(v);
            },
            (errs) => {
              const bad = localesWithErrors(errs as Record<string, unknown>);
              if (bad.length && !bad.includes(locale)) setLocale(bad[0]);
              setSaveState({ kind: "invalid" });
            },
          )}
          className="grid max-w-3xl gap-8"
        >
          <LocaleTabs value={locale} onChange={setLocale} errored={errored} />
          <div id="locale-panel" role="tabpanel" aria-labelledby={`tab-${locale}`}>
            <FormFields fields={cfg.fields} locale={locale} register={register} control={control} errors={formState.errors} />
          </div>
          <SaveBar state={saveState} />
        </form>
      ) : null}
    </>
  );
}
