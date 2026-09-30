"use client";

import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";
import { downloadCsv } from "@/lib/utils/format";
import type { PageMeta } from "@/types/api";
import type { ReactNode } from "react";

export interface DataColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  exportValue?: (row: T) => string | number | null;
}

export function DataTable<T extends { _id: string }>({
  rows,
  columns,
  meta,
  onPage,
  search,
  onSearch,
  toolbar,
  selected,
  onToggle,
  onToggleAll,
  mobile,
}: {
  rows: T[];
  columns: DataColumn<T>[];
  meta?: PageMeta;
  onPage?: (page: number) => void;
  search?: string;
  onSearch?: (value: string) => void;
  toolbar?: ReactNode;
  selected?: string[];
  onToggle?: (id: string) => void;
  onToggleAll?: () => void;
  mobile: (row: T) => ReactNode;
}) {
  const [hidden, setHidden] = useState<string[]>([]);
  const visible = columns.filter((column) => !hidden.includes(column.key));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {onSearch ? (
          <input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search" className="min-h-touch flex-1 rounded-2xl border border-line bg-surface px-4" aria-label="Search" />
        ) : null}
        {toolbar}
        <details className="rounded-2xl border border-line bg-surface px-3 py-2 text-sm">
          <summary className="cursor-pointer font-semibold">Columns</summary>
          <div className="mt-2 space-y-1">
            {columns.map((column) => (
              <label key={column.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hidden.includes(column.key)}
                  onChange={() => setHidden((current) => (current.includes(column.key) ? current.filter((item) => item !== column.key) : [...current, column.key]))}
                />
                {column.header}
              </label>
            ))}
          </div>
        </details>
        <button
          type="button"
          className="min-h-touch rounded-2xl border border-line px-3 text-sm font-semibold"
          onClick={() =>
            downloadCsv(
              "export.csv",
              rows.map((row) => Object.fromEntries(columns.map((column) => [column.header, column.exportValue ? column.exportValue(row) : ""]))),
            )
          }
        >
          Export
        </button>
      </div>
      <div className="space-y-3 md:hidden">{rows.map((row) => <div key={row._id}>{mobile(row)}</div>)}</div>
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-brand-light/60">
            <tr>
              {onToggleAll ? (
                <th className="p-3">
                  <input type="checkbox" aria-label="Select all" onChange={onToggleAll} checked={selected?.length === rows.length && rows.length > 0} />
                </th>
              ) : null}
              {visible.map((column) => (
                <th key={column.key} className="p-3 font-semibold">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._id} className="border-b border-line last:border-0">
                {onToggle ? (
                  <td className="p-3">
                    <input type="checkbox" aria-label="Select row" checked={selected?.includes(row._id)} onChange={() => onToggle(row._id)} />
                  </td>
                ) : null}
                {visible.map((column) => (
                  <td key={column.key} className="p-3 align-top">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meta && onPage ? <Pagination page={meta.page} totalPages={meta.totalPages} onPage={onPage} /> : null}
    </div>
  );
}
