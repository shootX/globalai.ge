"use client";

import { useParams } from "next/navigation";
import { ResourceEditor } from "@/components/admin/resource-editor";

export default function AdminProjectsEditPage() {
  const { id } = useParams<{ id: string }>();
  return <ResourceEditor key={id} resource="projects" id={id} />;
}
