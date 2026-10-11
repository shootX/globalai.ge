"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  email: z.email("ელ-ფოსტის ფორმატი არასწორია."),
  password: z.string().min(1, "შეიყვანეთ პაროლი."),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError(null);
    const res = await fetch("/api/v1/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      setError(res.status === 503 ? "API არ არის კონფიგურირებული." : "ელ-ფოსტა ან პაროლი არასწორია.");
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin/") ? next : "/admin");
    router.refresh();
  };

  return (
    <Card className="w-full max-w-sm rounded-none border-border shadow-none">
      <CardHeader className="gap-4">
        <Image src="/brand/globalai-logo.png" alt="globalAI" width={1471} height={292} priority style={{ height: 30, width: "auto" }} />
        <CardTitle className="text-3xl font-black tracking-tight">
          შესვლა<span className="text-brand">.</span>
        </CardTitle>
        <p className="micro text-muted-foreground">ადმინ-პანელი</p>
      </CardHeader>
      <CardContent>
        <form data-testid="admin-login-form" className="grid gap-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="admin-email">ელ-ფოსტა</Label>
            <Input id="admin-email" type="email" autoComplete="username" required data-testid="admin-login-email" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="admin-password">პაროლი</Label>
            <Input id="admin-password" type="password" autoComplete="current-password" required data-testid="admin-login-password" aria-invalid={!!errors.password} {...register("password")} />
            {errors.password ? <p className="text-sm text-destructive">{errors.password.message}</p> : null}
          </div>
          {error ? (
            <p role="alert" data-testid="admin-login-error" className="bg-[#FFE3DD] px-3 py-2 text-sm text-[#8A1C08]">
              {error}
            </p>
          ) : null}
          <Button type="submit" data-testid="admin-login-submit" disabled={isSubmitting} className="h-12 rounded-none bg-brand text-[19px] font-bold text-white hover:bg-brand-text">
            {isSubmitting ? "მიმდინარეობს…" : "შესვლა"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
