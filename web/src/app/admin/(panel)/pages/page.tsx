import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { PAGE_KEYS } from "@/lib/admin/types";

const NAMES: Record<string, string> = { home: "მთავარი", about: "ჩვენ შესახებ", services: "სერვისები", projects: "პროექტები", contact: "კონტაქტი" };

export default function AdminPagesPage() {
  return (
    <>
      <PageHeader label="კონტენტი" title="გვერდები და ტექსტები" />
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {PAGE_KEYS.map((k) => (
          <Link key={k} href={`/admin/pages/${k}`} data-testid={`admin-page-${k}`} className="bg-white p-6 hover:bg-muted">
            <p className="micro text-muted-foreground">{k}</p>
            <p className="mt-2 text-xl font-black">{NAMES[k]}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
