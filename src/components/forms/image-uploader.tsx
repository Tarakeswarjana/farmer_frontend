"use client";

import { useState } from "react";
import { Camera, ImagePlus, Trash2 } from "lucide-react";
import { documentsApi } from "@/lib/api/documents";
import { apiOrigin } from "@/lib/api/client";
import { isApiError } from "@/lib/api/errors";

async function compress(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return file;
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" });
}

export function ImageUploader({
  label,
  urls,
  onChange,
}: {
  label: string;
  urls: string[];
  onChange: (urls: string[]) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    setError(null);
    const files = [...list].slice(0, 8 - urls.length);
    for (const original of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(original.type)) {
        setError("Use JPEG, PNG, or WEBP.");
        continue;
      }
      if (original.size > 5 * 1024 * 1024) {
        setError("Each photo must be under 5 MB.");
        continue;
      }
      try {
        setProgress(1);
        const file = await compress(original);
        const local = URL.createObjectURL(file);
        setPreviews((current) => [...current, local]);
        const document = await documentsApi.upload(file, { documentType: "OTHER", ownerType: "USER" }, setProgress);
        const fileUrl = document.fileUrl ?? "";
        const absolute = fileUrl.startsWith("http") ? fileUrl : `${apiOrigin()}${fileUrl}`;
        onChange([...urls, absolute]);
      } catch (uploadError) {
        setError(isApiError(uploadError) ? uploadError.message : "Upload failed. Retry the photo.");
      } finally {
        setProgress(null);
      }
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-lg font-semibold">{label}</p>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex min-h-14 cursor-pointer items-center gap-2 rounded-2xl bg-brand px-4 font-semibold text-white">
          <Camera aria-hidden />
          Camera
          <input className="sr-only" type="file" accept="image/*" capture="environment" onChange={(event) => void handleFiles(event.target.files)} />
        </label>
        <label className="inline-flex min-h-14 cursor-pointer items-center gap-2 rounded-2xl border border-line bg-surface px-4 font-semibold">
          <ImagePlus aria-hidden />
          Gallery
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => void handleFiles(event.target.files)} />
        </label>
      </div>
      {progress != null ? <p className="text-sm font-semibold">Uploading {progress}%</p> : null}
      {error ? (
        <p role="alert" className="text-danger">
          {error}
        </p>
      ) : null}
      <ul className="grid grid-cols-3 gap-2">
        {previews.map((src) => (
          // Local preview of a file the user just chose.
          // eslint-disable-next-line @next/next/no-img-element
          <li key={src}><img src={src} alt="" className="h-24 w-full rounded-xl object-cover" /></li>
        ))}
      </ul>
      {urls.length > 0 ? (
        <button type="button" className="inline-flex items-center gap-2 text-danger" onClick={() => { onChange([]); setPreviews([]); }}>
          <Trash2 size={18} /> Remove
        </button>
      ) : null}
    </div>
  );
}
