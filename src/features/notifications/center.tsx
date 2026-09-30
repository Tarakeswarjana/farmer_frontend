"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ListSkeleton } from "@/components/ui/skeleton";
import { QueryView } from "@/components/common/query-view";
import { notificationsApi } from "@/lib/api/notifications";
import { queryKeys } from "@/lib/query/client";
import { sanitizeText } from "@/lib/utils/format";

export function NotificationCenter() {
  const common = useTranslations("common");
  const empty = useTranslations("empty");
  const client = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.notifications({ page: 1 }), queryFn: ({ signal }) => notificationsApi.list({ limit: 30 }, signal) });
  const read = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const all = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return (
    <div className="space-y-4">
      <PageHeader title={common("notifications")} action={<Button variant="secondary" onClick={() => all.mutate()}>{common("markAll")}</Button>} />
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={empty("notifications")} />}>
        {(data) => (
          <ul className="space-y-3">
            {data.items.map((item) => (
              <li key={item._id} className={`card p-4 ${item.isRead ? "opacity-70" : ""}`}>
                <p className="font-bold">{sanitizeText(item.title)}</p>
                <p>{sanitizeText(item.body)}</p>
                <p className="text-sm text-muted">{item.event} · {item.createdAt ? format(parseISO(item.createdAt), "PPp") : ""}</p>
                {!item.isRead ? <button type="button" className="mt-2 font-semibold text-brand-dark" onClick={() => read.mutate(item._id)}>{common("markRead")}</button> : null}
              </li>
            ))}
          </ul>
        )}
      </QueryView>
    </div>
  );
}
