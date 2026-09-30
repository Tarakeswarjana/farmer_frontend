import { api, getPage, unwrap } from "@/lib/api/client";
import type { DocumentRecord, PageQuery } from "@/types/api";

export const documentsApi = {
  async upload(file: File, input: { documentType: string; ownerType: "FARMER" | "BUYER" | "FPO" | "USER" }, onProgress?: (percent: number) => void) {
    const body = new FormData();
    body.append("file", file);
    body.append("documentType", input.documentType);
    body.append("ownerType", input.ownerType);
    return unwrap<DocumentRecord>(
      api.post("/documents", body, {
        onUploadProgress: (event) => {
          if (!onProgress || !event.total) return;
          onProgress(Math.round((event.loaded / event.total) * 100));
        },
      }),
    );
  },
  list(params?: PageQuery, signal?: AbortSignal) {
    return getPage<DocumentRecord>("/documents", params, signal);
  },
};
