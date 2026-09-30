"use client";

import { ErrorState } from "@/components/ui/error-state";
import type { ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";

export function QueryView<T>({
  query,
  skeleton,
  empty,
  isEmpty,
  children,
}: {
  query: UseQueryResult<T>;
  skeleton: ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}) {
  if (query.isLoading) return skeleton;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  if (!query.data) return skeleton;
  if (empty && isEmpty?.(query.data)) return empty;
  return children(query.data);
}
