"use client";

import { useParams } from "next/navigation";
import { PageEditor } from "@/components/admin/page-editor";
import { PAGE_KEYS, type PageKey } from "@/lib/admin/types";

export default function AdminPageEditPage() {
  const { key } = useParams<{ key: string }>();
  if (!(PAGE_KEYS as readonly string[]).includes(key)) return <p role="alert">უცნობი გვერდი.</p>;
  return <PageEditor key={key} pageKey={key as PageKey} />;
}
