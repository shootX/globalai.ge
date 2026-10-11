"use client";

import { useParams } from "next/navigation";
import { ResourceEditor } from "@/components/admin/resource-editor";

export default function AdminTeamEditPage() {
  const { id } = useParams<{ id: string }>();
  return <ResourceEditor key={id} resource="team" id={id} />;
}
