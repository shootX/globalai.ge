"use client";

import { useParams } from "next/navigation";
import { ResourceEditor } from "@/components/admin/resource-editor";

export default function AdminServicesEditPage() {
  const { id } = useParams<{ id: string }>();
  return <ResourceEditor key={id} resource="services" id={id} />;
}
