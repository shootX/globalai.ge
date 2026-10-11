"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { adminFetch, AdminApiError, jsonBody } from "@/lib/admin/client";
import { i18nSchema, localesWithErrors } from "@/lib/admin/fields";
import { ADMIN_LOCALES, emptyT, type AdminLocale, type AdminPage, type ApiItem, type PageKey, type Translations } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { PAGE_BLOCKS } from "@/lib/page-blocks";
import { LocaleTabs } from "./locale-tabs";
import { PageHeader } from "./page-header";
import { SaveBar, type SaveState } from "./save-bar";
import { StateBox } from "./state-box";

/** Block keys public pages read (block key == messages/<locale>.json key). See src/lib/page-blocks.ts. */
const DEFAULT_BLOCKS: Record<PageKey, readonly string[]> = PAGE_BLOCKS;

type FormValues = { blocks: Record<string, Translations>; seo_title: Translations; seo_description: Translations };

/** API content is keyed by locale ({ka:{block:..}}); the form edits it per block with KA/EN/RU tabs. */
function toForm(page: AdminPage | null, key: PageKey): FormValues {
  // Only string blocks are editable; Laravel seeds content as {ka:{blocks:[]}} — ignore non-string values.
  const str = (l: AdminLocale, n: string) => {
    const v = (page?.content?.[l] as Record<string, unknown> | null | undefined)?.[n];
    return typeof v === "string" ? v : "";
  };
  const extra = Object.entries((page?.content?.ka ?? {}) as Record<string, unknown>).filter(([, v]) => typeof v === "string").map(([k]) => k);
  const names = new Set([...DEFAULT_BLOCKS[key], ...extra]);
  const blocks: Record<string, Translations> = {};
  for (const n of names) blocks[n] = { ka: str("ka", n), en: str("en", n), ru: str("ru", n) };
  return { blocks, seo_title: page?.seo_title ?? emptyT(), seo_description: page?.seo_description ?? emptyT() };
}

function toApi(key: PageKey, v: FormValues): AdminPage {
  const content = { ka: {}, en: {}, ru: {} } as AdminPage["content"] & Record<AdminLocale, Record<string, string>>;
  for (const [n, t] of Object.entries(v.blocks)) for (const l of ADMIN_LOCALES) if (t[l]) content[l][n] = t[l] as string;
  return { key, content, seo_title: v.seo_title, seo_description: v.seo_description };
}

export function PageEditor({ pageKey }: { pageKey: PageKey }) {
  const q = useQuery({
    queryKey: ["pages", pageKey],
    queryFn: async () => {
      try {
        return (await adminFetch<ApiItem<AdminPage>>(`pages/${pageKey}`)).data;
      } catch (e) {
        if (e instanceof AdminApiError && e.status === 404) return null;
        throw e;
      }
    },
  });
  return (
    <>
      <Link href="/admin/pages" className="micro mb-4 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-3" aria-hidden="true" /> გვერდები
      </Link>
      <PageHeader label={`გვერდი · ${pageKey}`} title="ტექსტები" />
      {q.isLoading ? <StateBox kind="loading" /> : null}
      {q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {q.isSuccess ? <PageForm pageKey={pageKey} initial={toForm(q.data, pageKey)} /> : null}
    </>
  );
}

function PageForm({ pageKey, initial }: { pageKey: PageKey; initial: FormValues }) {
  const qc = useQueryClient();
  const [locale, setLocale] = useState<AdminLocale>("ka");
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [newBlock, setNewBlock] = useState("");
  const [blockNames, setBlockNames] = useState<string[]>(() => Object.keys(initial.blocks));
  const schema = useMemo(
    () =>
      z.object({
        blocks: z.object(Object.fromEntries(blockNames.map((n) => [n, i18nSchema(true)]))),
        seo_title: i18nSchema(false),
        seo_description: i18nSchema(false),
      }),
    [blockNames],
  );
  const { register, handleSubmit, getValues, setValue, formState } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: initial,
  });
  const save = useMutation({
    mutationFn: (v: FormValues) =>
      adminFetch<ApiItem<AdminPage>>(`pages/${pageKey}`, { method: "PUT", body: jsonBody(toApi(pageKey, { ...v, blocks: Object.fromEntries(blockNames.map((n) => [n, v.blocks[n] ?? getValues(`blocks.${n}`)])) })) }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["pages"] });
      setSaveState({ kind: "saved" });
    },
    onError: (e) => setSaveState({ kind: "error", message: (e as Error).message }),
  });

  const errored = localesWithErrors(formState.errors as Record<string, unknown>);
  const textField = (path: string, label: string, multiline = true) =>
    ADMIN_LOCALES.map((l) => {
      const id = `p-${path}-${l}`.replace(/\./g, "-");
      const err = (path.split(".").reduce<unknown>((n, p) => (n as Record<string, unknown> | undefined)?.[p], formState.errors) as Record<string, { message?: string }> | undefined)?.[l]?.message;
      const Comp = multiline ? Textarea : Input;
      return (
        <div key={l} className={cn("grid gap-2", l !== locale && "hidden")}>
          <Label htmlFor={id}>
            {label} <span className="micro text-muted-foreground">{l.toUpperCase()}</span>
          </Label>
          <Comp id={id} lang={l} data-testid={`admin-field-${path}-${l}`} aria-invalid={!!err} className="rounded-none bg-white" {...register(`${path}.${l}` as never)} />
          {err ? <p className="text-sm text-destructive">{err}</p> : null}
        </div>
      );
    });

  return (
    <>
      <form
          noValidate
          data-testid="admin-page-form"
          className="grid max-w-3xl gap-8"
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
        >
          <LocaleTabs value={locale} onChange={setLocale} errored={errored} />
          <div id="locale-panel" role="tabpanel" aria-labelledby={`tab-${locale}`} className="grid gap-6">
            {blockNames.map((n) => (
              <div key={n}>{textField(`blocks.${n}`, n)}</div>
            ))}
            <div className="flex items-end gap-2">
              <div className="grid gap-2">
                <Label htmlFor="new-block">ახალი ბლოკის გასაღები</Label>
                <Input id="new-block" value={newBlock} onChange={(e) => setNewBlock(e.target.value.replace(/[^a-z0-9_]/g, ""))} className="rounded-none bg-white" placeholder="მაგ. cta_text" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="rounded-none"
                disabled={!newBlock || blockNames.includes(newBlock)}
                onClick={() => {
                  setValue(`blocks.${newBlock}`, emptyT());
                  setBlockNames((b) => [...b, newBlock]);
                  setNewBlock("");
                }}
              >
                <Plus className="size-4" aria-hidden="true" /> დამატება
              </Button>
            </div>
            <div className="grid gap-6 border-t border-border pt-6">
              {textField("seo_title", "SEO სათაური", false)}
              {textField("seo_description", "SEO აღწერა")}
            </div>
          </div>
          <SaveBar state={saveState} />
        </form>
    </>
  );
}
