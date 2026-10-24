"use client";

import { Controller, type Control, type FieldErrors, type FieldValues, type UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Field } from "@/lib/admin/fields";
import { ADMIN_LOCALES, type AdminLocale } from "@/lib/admin/types";
import { cn } from "@/lib/utils";
import { ImageField } from "./image-field";

type FormFieldsProps = {
  fields: Field[];
  locale: AdminLocale;
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
};

function errorAt(errors: FieldErrors<FieldValues>, path: string): string | undefined {
  let node: unknown = errors;
  for (const p of path.split(".")) node = node && typeof node === "object" ? (node as Record<string, unknown>)[p] : undefined;
  const msg = node && typeof node === "object" ? (node as { message?: unknown }).message : undefined;
  return typeof msg === "string" ? msg : undefined;
}

export function FormFields({ fields, locale, register, control, errors }: FormFieldsProps) {
  return (
    <div className="grid gap-6">
      {fields.map((f) => {
        if (f.kind === "i18n") {
          return (
            <div key={f.name}>
              {ADMIN_LOCALES.map((l) => {
                const id = `f-${f.name}-${l}`;
                const err = errorAt(errors, `${f.name}.${l}`);
                const Comp = f.multiline ? Textarea : Input;
                return (
                  <div key={l} className={cn("grid gap-2", l !== locale && "hidden")}>
                    <Label htmlFor={id}>
                      {f.label} <span className="micro text-muted-foreground">{l.toUpperCase()}</span>
                      {f.required && l === "ka" ? <span className="text-brand-text"> *</span> : null}
                    </Label>
                    <Comp
                      id={id}
                      lang={l}
                      data-testid={`admin-field-${f.name}-${l}`}
                      aria-invalid={!!err}
                      aria-describedby={err ? `${id}-err` : undefined}
                      className={cn("rounded-none bg-white", f.multiline && "min-h-28")}
                      {...register(`${f.name}.${l}`)}
                    />
                    {err ? (
                      <p id={`${id}-err`} className="text-sm text-destructive">
                        {err}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        }
        const id = `f-${f.name}`;
        const err = errorAt(errors, f.name);
        if (f.kind === "switch") {
          return (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              render={({ field }) => (
                <div className="flex items-center gap-3">
                  <Switch id={id} checked={!!field.value} onCheckedChange={field.onChange} data-testid={`admin-field-${f.name}`} />
                  <Label htmlFor={id}>{f.label}</Label>
                </div>
              )}
            />
          );
        }
        if (f.kind === "image" || f.kind === "gallery") {
          return (
            <Controller
              key={f.name}
              name={f.name}
              control={control}
              render={({ field }) => (
                <ImageField
                  label={f.label}
                  multiple={f.kind === "gallery"}
                  testId={`admin-field-${f.name}`}
                  value={f.kind === "gallery" ? ((field.value as string[]) ?? []) : field.value ? [field.value as string] : []}
                  onChange={(v) => field.onChange(f.kind === "gallery" ? v : (v[0] ?? null))}
                />
              )}
            />
          );
        }
        if (f.kind === "select") {
          return (
            <div key={f.name} className="grid gap-2">
              <Label htmlFor={id}>{f.label}</Label>
              <select id={id} data-testid={`admin-field-${f.name}`} className="h-9 max-w-md rounded-none border border-input bg-white px-3 text-sm" {...register(f.name)}>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {err ? <p className="text-sm text-destructive">{err}</p> : null}
            </div>
          );
        }
        return (
          <div key={f.name} className="grid gap-2">
            <Label htmlFor={id}>{f.label}</Label>
            <Input
              id={id}
              type={f.kind === "number" ? "number" : (f.type ?? "text")}
              min={f.kind === "number" ? 0 : undefined}
              data-testid={`admin-field-${f.name}`}
              aria-invalid={!!err}
              className="max-w-md rounded-none bg-white"
              {...register(f.name, f.kind === "number" ? { valueAsNumber: true } : undefined)}
            />
            {err ? <p className="text-sm text-destructive">{err}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
