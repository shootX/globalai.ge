"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUpload, freshUploads, uploadImage } from "@/lib/admin/client";
import { storageUrl } from "@/lib/admin/storage";

type ImageFieldProps = {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  multiple?: boolean;
  testId: string;
};

/** Uploads via POST /api/v1/admin/uploads; stores returned `path`, previews with returned `url` (else derived from path). */
export function ImageField({ label, value, onChange, multiple = false, testId }: ImageFieldProps) {
  const id = useId();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<Record<string, string>>({});

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError(null);
    setIsUploading(true);
    try {
      const paths: string[] = [];
      const fresh: Record<string, string> = {};
      for (const f of Array.from(files)) {
        const r = await uploadImage(f);
        paths.push(r.path);
        fresh[r.path] = r.url;
      }
      setPreviews((p) => ({ ...p, ...fresh }));
      onChange(multiple ? [...value, ...paths] : paths.slice(0, 1));
    } catch {
      setError("ატვირთვა ვერ მოხერხდა (jpg/png/webp/gif, მაქს. 5 MB).");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex flex-wrap gap-3">
        {value.map((src, i) => (
          <div key={`${src.slice(0, 40)}-${i}`} className="relative size-28 border border-border bg-muted">
            <Image src={previews[src] ?? storageUrl(src) ?? ""} alt="" fill unoptimized className="object-contain" sizes="112px" />
            <button
              type="button"
              data-testid="admin-image-remove"
              onClick={async () => {
                if (!window.confirm("წავშალოთ სურათი?")) return;
                setError(null);
                if (freshUploads.has(src)) {
                  // Never saved into a record: delete the file right away.
                  try {
                    await deleteUpload(src);
                  } catch (e) {
                    setError(`ფაილის წაშლა ვერ მოხერხდა: ${(e as Error).message}`);
                    return;
                  }
                }
                // Saved files are deleted only after the record save succeeds (see editors).
                onChange(value.filter((_, j) => j !== i));
              }}
              className="absolute right-1 top-1 bg-primary p-1 text-white"
              aria-label="სურათის წაშლა"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        {multiple || value.length === 0 ? (
          <Button asChild variant="outline" className="size-28 flex-col rounded-none border-dashed">
            <label htmlFor={id} className="cursor-pointer">
              <ImagePlus className="size-5" aria-hidden="true" />
              <span className="text-xs">{isUploading ? "იტვირთება…" : "ატვირთვა"}</span>
            </label>
          </Button>
        ) : null}
      </div>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple={multiple}
        className="sr-only"
        data-testid={testId}
        onChange={(e) => {
          void onFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
