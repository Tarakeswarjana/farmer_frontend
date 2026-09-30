"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { refreshAccessToken } from "@/lib/api/client";
import { usersApi } from "@/lib/api/users";
import { tokenStore } from "@/lib/auth/token-store";
import { getQueryClient } from "@/lib/query/client";
import { useAuthStore } from "@/stores/auth-store";
import { useUiStore } from "@/stores/ui-store";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ServiceWorkerRegister } from "@/components/pwa/register-sw";

function ThemeSync() {
  const theme = useUiStore((state) => state.theme);
  useEffect(() => {
    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  }, [theme]);
  return null;
}

function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const setStatus = useAuthStore((state) => state.setStatus);
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (!tokenStore.hasPersistedSession()) {
        setStatus("anonymous");
        setReady(true);
        return;
      }
      const token = await refreshAccessToken();
      if (!token) {
        tokenStore.clear();
        if (!cancelled) setReady(true);
        return;
      }
      try {
        const user = await usersApi.me();
        tokenStore.setUser(user);
      } catch {
        tokenStore.clear();
        router.replace("/auth/login?reason=session");
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, [router, setStatus]);

  if (!ready) return <div className="p-6 text-lg font-semibold">Loading</div>;
  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const client = getQueryClient();
  return (
    <QueryClientProvider client={client}>
      <ThemeSync />
      <AuthBootstrap>
        {children}
        <OfflineBanner />
        <InstallPrompt />
        <ServiceWorkerRegister />
        <Toaster position="top-center" richColors />
      </AuthBootstrap>
    </QueryClientProvider>
  );
}
