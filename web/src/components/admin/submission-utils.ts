import type { SubmissionStatus } from "@/lib/admin/types";

export const STATUS_LABEL: Record<SubmissionStatus, string> = { new: "ახალი", read: "წაკითხული", archived: "არქივი" };

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("ka-GE", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Tbilisi" }).format(new Date(iso));
