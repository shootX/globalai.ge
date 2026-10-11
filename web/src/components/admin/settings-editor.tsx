"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { adminFetch, jsonBody, cleanupRemovedImages, imagePaths } from "@/lib/admin/client";
import { buildSchema, i18nSchema, localesWithErrors, type Field } from "@/lib/admin/fields";
import { ADMIN_LOCALES, emptyT, type AdminLocale, type AdminSettings, type ApiItem } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { FormFields } from "./form-fields";
import { LocaleTabs } from "./locale-tabs";
import { PageHeader } from "./page-header";
import { SaveBar, type SaveState } from "./save-bar";
import { StateBox } from "./state-box";

const CONTACT: Field[] = [
  { kind: "text", name: "contact_email", label: "ელ-ფოსტა", type: "email" },
  { kind: "text", name: "contact_phone", label: "ტელეფონი", type: "tel" },
  { kind: "i18n", name: "contact_address", label: "მისამართი", required: true },
];
const SOCIALS: Field[] = (["facebook", "instagram", "linkedin", "behance"] as const).map((k) => ({
  kind: "text",
  name: `socials.${k}`,
  label: k[0].toUpperCase() + k.slice(1),
  type: "url",
}));
const BRAND: Field[] = [{ kind: "image", name: "logo", label: "ლოგო" }];
const FLAGS: Field[] = [
  { kind: "switch", name: "projects_nav_visible", label: "„პროექტები“ მენიუში ჩანს (projects_nav_visible)" },
  { kind: "switch", name: "team_visible", label: "გუნდის ბლოკი ჩანს (team_visible)" },
  { kind: "switch", name: "stats_visible", label: "სტატისტიკა ჩანს (stats_visible)" },
];

const EMPTY: AdminSettings = {
  contact_email: "",
  contact_phone: "",
  contact_address: emptyT(),
  socials: { facebook: "", instagram: "", linkedin: "", behance: "" },
  logo: null,
  stats: [],
  projects_nav_visible: true,
  team_visible: false,
  stats_visible: false,
};

export function SettingsEditor() {
  const qc = useQueryClient();
  const [locale, setLocale] = useState<AdminLocale>("ka");
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const schema = useMemo(
    () =>
      buildSchema([...CONTACT, ...BRAND, ...FLAGS]).extend({
        socials: z.object(Object.fromEntries(["facebook", "instagram", "linkedin", "behance"].map((k) => [k, z.string().trim().nullable().optional()]))),
        stats: z.array(z.object({ value: z.string().trim().min(1, "მნიშვნელობა სავალდებულოა."), label: i18nSchema(true) })),
      }),
    [],
  );
  const q = useQuery({ queryKey: ["settings"], queryFn: () => adminFetch<ApiItem<AdminSettings>>("settings") });
  const { register, control, handleSubmit, reset, formState } = useForm<FieldValues>({ resolver: zodResolver(schema) as never, defaultValues: EMPTY });
  const stats = useFieldArray({ control, name: "stats" });
  const savedImages = useRef<string[]>([]);
  useEffect(() => {
    if (q.data) {
      reset({ ...EMPTY, ...q.data.data, socials: { ...EMPTY.socials, ...q.data.data.socials } });
      savedImages.current = imagePaths(BRAND, q.data.data as unknown as Record<string, unknown>);
    }
  }, [q.data, reset]);

  const save = useMutation({
    mutationFn: (v: FieldValues) => adminFetch<ApiItem<AdminSettings>>("settings", { method: "PUT", body: jsonBody(v) }),
    onSuccess: async (res, v) => {
      const after = imagePaths(BRAND, (res?.data as unknown as Record<string, unknown>) ?? v);
      const cleanupError = await cleanupRemovedImages(savedImages.current, after);
      savedImages.current = after;
      void qc.invalidateQueries({ queryKey: ["settings"] });
      setSaveState(cleanupError ? { kind: "error", message: cleanupError } : { kind: "saved" });
    },
    onError: (e) => setSaveState({ kind: "error", message: (e as Error).message }),
  });
  const errored = localesWithErrors(formState.errors as Record<string, unknown>);
  const statErr = (i: number, key: "value" | "ka") => {
    const e = (formState.errors.stats as unknown as Array<{ value?: { message?: string }; label?: { ka?: { message?: string } } }> | undefined)?.[i];
    const msg = key === "value" ? e?.value?.message : e?.label?.ka?.message;
    return msg ? <p className="text-sm text-destructive">{msg}</p> : null;
  };
  const section = (title: string) => <h2 className="micro border-b border-border pb-2 text-muted-foreground">{title}</h2>;

  return (
    <>
      <PageHeader label="საიტი" title="პარამეტრები" />
      {q.isLoading ? <StateBox kind="loading" /> : null}
      {q.isError ? <StateBox kind="error" message={(q.error as Error).message} /> : null}
      {q.data ? (
        <form
          noValidate
          data-testid="admin-settings-form"
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
          <div id="locale-panel" role="tabpanel" aria-labelledby={`tab-${locale}`} className="grid gap-10">
            <div className="grid gap-5">
              {section("საკონტაქტო ინფორმაცია")}
              <FormFields fields={CONTACT} locale={locale} register={register} control={control} errors={formState.errors} />
            </div>
            <div className="grid gap-5">
              {section("სოციალური ქსელები")}
              <FormFields fields={SOCIALS} locale={locale} register={register} control={control} errors={formState.errors} />
            </div>
            <div className="grid gap-5">
              {section("ბრენდი")}
              <FormFields fields={BRAND} locale={locale} register={register} control={control} errors={formState.errors} />
            </div>
            <div className="grid gap-5">
              {section("ხილვადობა")}
              <FormFields fields={FLAGS} locale={locale} register={register} control={control} errors={formState.errors} />
            </div>
            <div className="grid gap-5" data-testid="admin-stats">
              {section("სტატისტიკა (stats)")}
              {stats.fields.length === 0 ? <p className="text-sm text-muted-foreground">სტატისტიკა არ არის დამატებული.</p> : null}
              {stats.fields.map((row, i) => (
                <div key={row.id} className="grid gap-3 border border-border bg-white p-4 sm:grid-cols-[140px_1fr_auto] sm:items-end">
                  <div className="grid gap-2">
                    <Label htmlFor={`stat-v-${i}`}>მნიშვნელობა</Label>
                    <Input id={`stat-v-${i}`} className="rounded-none" placeholder="50+" data-testid={`admin-stat-value-${i}`} {...register(`stats.${i}.value`)} />
                    {statErr(i, "value")}
                  </div>
                  <div>
                    {ADMIN_LOCALES.map((l) => (
                      <div key={l} className={cn("grid gap-2", l !== locale && "hidden")}>
                        <Label htmlFor={`stat-l-${i}-${l}`}>
                          წარწერა <span className="micro text-muted-foreground">{l.toUpperCase()}</span>
                        </Label>
                        <Input id={`stat-l-${i}-${l}`} lang={l} className="rounded-none" {...register(`stats.${i}.label.${l}`)} />
                        {l === "ka" ? statErr(i, "ka") : null}
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" className="rounded-none" aria-label={`სტატისტიკის ${i + 1} წაშლა`} onClick={() => stats.remove(i)}>
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" className="w-fit rounded-none" data-testid="admin-stat-add" onClick={() => stats.append({ value: "", label: emptyT() })}>
                <Plus className="size-4" aria-hidden="true" /> სტატისტიკის დამატება
              </Button>
            </div>
          </div>
          <Separator />
          <SaveBar state={saveState} />
        </form>
      ) : null}
    </>
  );
}
