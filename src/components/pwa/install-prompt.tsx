"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const t = useTranslations("common");
  const dismissed = useUiStore((state) => state.installDismissed);
  const dismiss = useUiStore((state) => state.dismissInstall);
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visits, setVisits] = useState(0);

  useEffect(() => {
    const count = Number(window.localStorage.getItem("vm.visits") ?? "0") + 1;
    window.localStorage.setItem("vm.visits", String(count));
    setVisits(count);
    const onPrompt = (promptEvent: Event) => {
      promptEvent.preventDefault();
      setEvent(promptEvent as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!event || dismissed || visits < 2) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 card p-4 md:bottom-6 md:left-auto md:right-6 md:max-w-sm">
      <h2 className="text-lg font-bold">{t("installTitle")}</h2>
      <p className="mt-1 text-sm text-muted">{t("installBody")}</p>
      <div className="mt-3 flex gap-2">
        <Button
          onClick={() => {
            void event.prompt();
            dismiss();
          }}
        >
          {t("install")}
        </Button>
        <Button variant="ghost" onClick={dismiss}>
          {t("notNow")}
        </Button>
      </div>
    </div>
  );
}
