"use client";

export function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button type="button" className="min-h-touch rounded-2xl border border-line px-4 disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <p className="text-sm font-semibold">
        {page} / {Math.max(totalPages, 1)}
      </p>
      <button type="button" className="min-h-touch rounded-2xl border border-line px-4 disabled:opacity-40" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
