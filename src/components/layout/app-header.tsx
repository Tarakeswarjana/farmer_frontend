"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LogOut, MessageCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { authApi } from "@/lib/api/auth";
import { notificationsApi } from "@/lib/api/notifications";
import { tokenStore } from "@/lib/auth/token-store";
import { queryKeys } from "@/lib/query/client";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore, type ThemeMode } from "@/stores/ui-store";

export function AppHeader({ home }: { home: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const client = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const unread = useQuery({
    queryKey: queryKeys.notifications({ unread: true }),
    queryFn: () => notificationsApi.list({ isRead: false, limit: 1 }),
    enabled: Boolean(user),
    refetchInterval: 60_000,
  });

  function setLocale(next: "bn" | "en") {
    document.cookie = `vm_locale=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <Link href={home} className="text-lg font-bold text-brand-dark">
        {t("appName")}
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-line bg-surface p-1 text-sm font-semibold" role="group" aria-label={t("language")}>
          <button type="button" className={`rounded-full px-3 py-1 ${locale === "bn" ? "bg-brand text-white" : ""}`} onClick={() => setLocale("bn")}>
            বাংলা
          </button>
          <button type="button" className={`rounded-full px-3 py-1 ${locale === "en" ? "bg-brand text-white" : ""}`} onClick={() => setLocale("en")}>
            English
          </button>
        </div>
        <label className="sr-only" htmlFor="theme-mode">{t("theme")}</label>
        <select id="theme-mode" className="min-h-10 rounded-full border border-line bg-surface px-2 text-sm" value={theme} onChange={(event) => setTheme(event.target.value as ThemeMode)}>
          <option value="light">{t("light")}</option>
          <option value="dark">{t("dark")}</option>
          <option value="system">{t("system")}</option>
        </select>
        <Link href="/notifications" className="relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border border-line" aria-label={t("notifications")}>
          <Bell size={18} />
          {unread.data && unread.data.meta.total > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-danger px-1 text-xs text-white">{unread.data.meta.total}</span> : null}
        </Link>
        <Link href="/messages" className="inline-flex min-h-10 items-center gap-1 px-2 text-sm font-semibold" aria-label={t("chat")}>
          <MessageCircle size={16} />
          {t("chat")}
        </Link>
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-1 px-2 text-sm font-semibold"
          onClick={() => {
            const refresh = tokenStore.getRefreshToken();
            void (refresh ? authApi.logout(refresh) : Promise.resolve()).finally(() => {
              tokenStore.clear();
              client.clear();
              router.replace("/auth/login");
            });
          }}
        >
          <LogOut size={16} />
          {t("signOut")}
        </button>
      </div>
    </header>
  );
}
