import { Suspense } from "react";
import { AdminProviders } from "@/components/admin/providers";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <Suspense>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </AdminProviders>
  );
}
