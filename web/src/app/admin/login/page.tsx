import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "შესვლა" };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center px-5">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
