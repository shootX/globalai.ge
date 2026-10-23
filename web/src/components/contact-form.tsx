"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { postContact } from "@/lib/contact-client";

type ContactFormProps = { locale: Locale; compact?: boolean };
type Status = "idle" | "sending" | "success" | "error";

function buildSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(1, t("errors.nameRequired")).max(120, t("errors.tooLong")),
    email: z
      .string()
      .trim()
      .min(1, t("errors.emailRequired"))
      .pipe(z.email(t("errors.emailInvalid")))
      .pipe(z.string().max(190, t("errors.tooLong"))),
    subject: z.string().trim().max(190, t("errors.tooLong")).optional(),
    message: z.string().trim().min(2, t("errors.messageShort")).max(5000, t("errors.tooLong")),
    company_website: z.string().max(0).optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function ContactForm({ locale, compact = false }: ContactFormProps) {
  const t = useTranslations("form");
  const schema = useMemo(() => buildSchema(t), [t]);
  const [status, setStatus] = useState<Status>("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { company_website: "" } });

  const onSubmit = async (values: FormValues) => {
    if (values.company_website) {
      // Honeypot filled → silently pretend success.
      setStatus("success");
      return;
    }
    setStatus("sending");
    try {
      await postContact({ ...values, subject: values.subject || undefined, company_website: undefined, locale });
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const err = (name: keyof FormValues) =>
    errors[name]?.message ? (
      <p className="ferr" id={`${name}-error`}>
        {errors[name]?.message}
      </p>
    ) : null;
  const describedBy = (name: keyof FormValues) => (errors[name] ? `${name}-error` : undefined);

  const nameField = (
    <div>
      <label htmlFor="name">
        {t("name")}
      </label>
      <input
        id="name"
        type="text"
        required
        autoComplete="name"
        placeholder={t("namePh")}
        data-testid="contact-name"
        aria-invalid={errors.name ? true : undefined}
        aria-describedby={describedBy("name")}
        {...register("name")}
      />
      {err("name")}
    </div>
  );
  const emailField = (
    <div>
      <label htmlFor="email">
        {t("email")}
      </label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        placeholder="name@example.com"
        data-testid="contact-email"
        aria-invalid={errors.email ? true : undefined}
        aria-describedby={describedBy("email")}
        {...register("email")}
      />
      {err("email")}
    </div>
  );

  return (
    <form className="contact" data-testid="contact-form" onSubmit={handleSubmit(onSubmit)}>
      {compact ? (
        <>
          {nameField}
          {emailField}
        </>
      ) : (
        <div className="row2">
          {nameField}
          {emailField}
        </div>
      )}
      <div>
        <label htmlFor="subject">
          {t("subject")} <span className="opt">{t("optional")}</span>
        </label>
        <input
          id="subject"
          type="text"
          placeholder={t("subjectPh")}
          data-testid="contact-subject"
          aria-describedby={describedBy("subject")}
          {...register("subject")}
        />
        {err("subject")}
      </div>
      <div>
        <label htmlFor="message">
          {t("message")}
        </label>
        <textarea
          id="message"
          required
          rows={compact ? 4 : 6}
          placeholder={t("messagePh")}
          data-testid="contact-message"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message")}
          {...register("message")}
        />
        {err("message")}
      </div>
      <div className="hp" aria-hidden="true">
        <label htmlFor="company_website">{t("honeypot")}</label>
        <input id="company_website" type="text" tabIndex={-1} autoComplete="off" {...register("company_website")} />
      </div>
      <button type="submit" className="btn" data-testid="contact-submit" disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("submit")} <span aria-hidden="true">→</span>
      </button>
      {status === "success" ? (
        <p className="fstatus ok" role="status" data-testid="contact-success">
          {t("success")}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="fstatus err" role="alert" data-testid="contact-error">
          {t("error")}
        </p>
      ) : null}
    </form>
  );
}
