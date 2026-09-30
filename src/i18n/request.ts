import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { bn, en, type Messages } from "@/i18n/dictionaries";

export const locales = ["bn", "en"] as const;
export type AppLocale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const jar = await cookies();
  const requested = jar.get("vm_locale")?.value;
  const locale: AppLocale = requested === "en" ? "en" : "bn";
  const messages: Messages = locale === "en" ? en : bn;
  return { locale, messages };
});
