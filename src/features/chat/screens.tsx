"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { ListSkeleton } from "@/components/ui/skeleton";
import { QueryView } from "@/components/common/query-view";
import { conversationsApi } from "@/lib/api/conversations";
import { queryKeys } from "@/lib/query/client";
import { sanitizeText } from "@/lib/utils/format";
import { useAuthStore } from "@/stores/auth-store";

export function ConversationList() {
  const empty = useTranslations("empty");
  const common = useTranslations("common");
  const query = useQuery({ queryKey: queryKeys.conversations, queryFn: ({ signal }) => conversationsApi.list({ limit: 30 }, signal) });
  return (
    <div className="space-y-3">
      <PageHeader title={common("chat")} />
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={empty("messages")} />}>
        {(data) => data.items.map((item) => (
          <Link key={item._id} href={`/messages/${item._id}`} className="card mb-3 block p-4">
            <p className="font-bold">{sanitizeText(item.lastMessage) || item._id.slice(-6)}</p>
            <p className="text-sm text-muted">{item.lastMessageAt ? format(parseISO(item.lastMessageAt), "PPp") : ""}</p>
          </Link>
        ))}
      </QueryView>
    </div>
  );
}

export function ChatThread({ id }: { id: string }) {
  const common = useTranslations("common");
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const [text, setText] = useState("");
  const messages = useQuery({ queryKey: queryKeys.messages(id), queryFn: ({ signal }) => conversationsApi.messages(id, { limit: 50, sortOrder: "asc" }, signal), refetchInterval: 8000 });
  const send = useMutation({
    mutationFn: () => conversationsApi.send(id, { message: text }),
    onSuccess: async () => {
      setText("");
      await client.invalidateQueries({ queryKey: queryKeys.messages(id) });
      await client.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
  return (
    <div className="flex min-h-[70vh] flex-col">
      <PageHeader title={common("chat")} />
      <div className="card mb-3 flex-1 space-y-2 p-3">
        {messages.isLoading ? <ListSkeleton /> : null}
        {messages.data?.items.map((message) => {
          const mine = message.senderId === user?._id;
          return (
            <p key={message._id} className={`max-w-[80%] rounded-2xl px-3 py-2 ${mine ? "ml-auto bg-brand text-white" : "bg-brand-light"}`}>
              {sanitizeText(message.message)}
            </p>
          );
        })}
      </div>
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); if (text.trim()) send.mutate(); }}>
        <label className="sr-only" htmlFor="chat-text">{common("send")}</label>
        <input id="chat-text" className="min-h-14 flex-1 rounded-2xl border border-line px-3" value={text} onChange={(event) => setText(event.target.value)} />
        <Button disabled={send.isPending}>{common("send")}</Button>
      </form>
    </div>
  );
}
