"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminFetch, AdminApiError, jsonBody } from "@/lib/admin/client";
import { i18nSchema, localesWithErrors } from "@/lib/admin/fields";
import { adminOps } from "@/lib/admin/ops-copy";
import { ADMIN_LOCALES, emptyT, type AdminLocale, type AdminPage, type ApiItem, type PageKey, type Translations } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { PAGE_BLOCK_GROUPS, PAGE_BLOCKS, type BlockGroup } from "@/lib/page-blocks";
import kaMessages from "../../../messages/ka.json";
import enMessages from "../../../messages/en.json";
import ruMessages from "../../../messages/ru.json";
import { LocaleTabs } from "./locale-tabs";
import { PageHeader } from "./page-header";
import { SaveBar, type SaveState } from "./save-bar";
import { SeoPreview, seoText } from "./seo-preview";
import { ImageField } from "./image-field";
import { StateBox } from "./state-box";

const ops = adminOps("ka");

/** Block keys public pages read (block key == messages/<locale>.json key). See src/lib/page-blocks.ts. */
const DEFAULT_BLOCKS: Record<PageKey, readonly string[]> = PAGE_BLOCKS;
const GROUPS: Record<PageKey, readonly BlockGroup[]> = PAGE_BLOCK_GROUPS;
const MESSAGES: Record<AdminLocale, Record<string, unknown>> = { ka: kaMessages, en: enMessages, ru: ruMessages };

/** The built-in text the public page shows while a block is empty — used as the editor's starting value. */
function builtIn(l: AdminLocale, page: PageKey, block: string): string {
  const v = (MESSAGES[l][page] as Record<string, unknown> | undefined)?.[block];
  return typeof v === "string" ? v : "";
}

type FormValues = { blocks: Record<string, Translations>; seo_title: Translations; seo_description: Translations; og_image: string | null; noindex: boolean };

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
  // Empty blocks start from the built-in text, so the editor shows exactly what the site shows today.
  for (const n of names) blocks[n] = { ka: str("ka", n) || builtIn("ka", key, n), en: str("en", n) || builtIn("en", key, n), ru: str("ru", n) || builtIn("ru", key, n) };
  return { blocks, seo_title: page?.seo_title ?? emptyT(), seo_description: page?.seo_description ?? emptyT(), og_image: page?.og_image ?? null, noindex: page?.noindex ?? false };
}

function toApi(key: PageKey, v: FormValues): AdminPage {
  const content = { ka: {}, en: {}, ru: {} } as AdminPage["content"] & Record<AdminLocale, Record<string, string>>;
  for (const [n, t] of Object.entries(v.blocks)) for (const l of ADMIN_LOCALES) if (t[l]) content[l][n] = t[l] as string;
  return { key, content, seo_title: v.seo_title, seo_description: v.seo_description, og_image: v.og_image, noindex: v.noindex };
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
  const [section, setSection] = useState<"content" | "seo">("content");
  const schema = useMemo(
    () =>
      z.object({
        blocks: z.object(Object.fromEntries(blockNames.map((n) => [n, i18nSchema(true)]))),
        seo_title: i18nSchema(false),
        seo_description: i18nSchema(false),
        og_image: z.string().nullable().optional(),
        noindex: z.boolean(),
      }),
    [blockNames],
  );
  const { register, handleSubmit, getValues, setValue, control, formState } = useForm<FormValues>({
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
  const textField = (path: string, label: React.ReactNode, multiline = true) =>
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

  const watched = useWatch({ control });
  const known = new Set(DEFAULT_BLOCKS[pageKey]);
  const extraNames = blockNames.filter((n) => !known.has(n));

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
          <div role="tablist" aria-label="სექცია" className="inline-flex w-fit border border-primary">
            <button type="button" role="tab" data-testid="admin-section-content" aria-selected={section === "content"} className={cn("micro px-4 py-2.5", section === "content" ? "bg-primary text-primary-foreground" : "text-primary")} onClick={() => setSection("content")}>
              {ops.contentTab}
            </button>
            <button type="button" role="tab" data-testid="admin-section-seo" aria-selected={section === "seo"} className={cn("micro px-4 py-2.5", section === "seo" ? "bg-primary text-primary-foreground" : "text-primary")} onClick={() => setSection("seo")}>
              {ops.seoTab}
            </button>
          </div>
          <LocaleTabs value={locale} onChange={setLocale} errored={errored} />
          <div id="locale-panel" role="tabpanel" aria-labelledby={`tab-${locale}`} className={cn("grid gap-6", section !== "content" && "hidden")}>
            <p className="text-sm text-muted-foreground">
              ველები უკვე შევსებულია იმ ტექსტით, რომელიც ახლა საიტზე ჩანს. შეცვალეთ საჭირო ადგილი და შეინახეთ. EN და RU ცარიელი ველი საიტზე ჩაშენებულ თარგმანს აჩვენებს.
            </p>
            {GROUPS[pageKey].map((g) => (
              <fieldset key={g.title} className="grid gap-5 border-t border-primary/20 pt-5" data-testid="admin-block-group">
                <legend className="micro pr-3 text-primary">{g.title}</legend>
                {g.blocks.map((b) => (
                  <div key={b.key}>
                    {textField(
                      `blocks.${b.key}`,
                      <>
                        {b.label} <code className="text-xs text-muted-foreground">{b.key}</code>
                      </>,
                      Boolean(b.long),
                    )}
                  </div>
                ))}
              </fieldset>
            ))}
            {extraNames.length > 0 ? (
              <fieldset className="grid gap-5 border-t border-primary/20 pt-5">
                <legend className="micro pr-3 text-primary">დამატებითი ბლოკები</legend>
                {extraNames.map((n) => (
                  <div key={n} className="grid gap-2">
                    {textField(`blocks.${n}`, n)}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-fit rounded-none text-muted-foreground"
                      data-testid={`admin-block-remove-${n}`}
                      onClick={() => setBlockNames((b) => b.filter((x) => x !== n))}
                    >
                      <X className="size-4" aria-hidden="true" /> ბლოკის წაშლა
                    </Button>
                  </div>
                ))}
              </fieldset>
            ) : null}
            <div className="flex flex-wrap items-end gap-2">
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
          </div>
          <div className={cn("grid gap-6", section !== "seo" && "hidden")} data-testid="admin-seo-tab">
            {textField("seo_title", "SEO სათაური", false)}
            {textField("seo_description", "SEO აღწერა")}
            <Controller
              name="og_image"
              control={control}
              render={({ field }) => (
                <ImageField label={ops.ogImage} value={field.value ? [field.value] : []} onChange={(paths) => field.onChange(paths[0] ?? null)} testId="admin-field-og_image" />
              )}
            />
            <Controller
              name="noindex"
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch id="page-noindex" checked={!!field.value} onCheckedChange={field.onChange} data-testid="admin-field-noindex" />
                  <Label htmlFor="page-noindex">{ops.noindex}</Label>
                </div>
              )}
            />
            <SeoPreview title={seoText(watched.seo_title as Translations | undefined, locale)} description={seoText(watched.seo_description as Translations | undefined, locale)} />
          </div>
          <SaveBar state={saveState} />
        </form>
    </>
  );
}
