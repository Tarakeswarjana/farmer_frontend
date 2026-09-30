import type { Metadata } from "next";
import { Noto_Sans_Bengali } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

const font = Noto_Sans_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: "Sabji Haat", template: "%s · Sabji Haat" },
  description: "Farmer to wholesale vegetable marketplace for Kolkata and North 24 Parganas.",
  applicationName: process.env.NEXT_PUBLIC_APP_NAME || "Sabji Haat",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Sabji Haat", statusBarStyle: "default" },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  openGraph: { title: "Sabji Haat", description: "Vegetables from the farm to the wholesale market.", url: appUrl, siteName: "Sabji Haat", locale: "bn_IN", type: "website" },
  twitter: { card: "summary_large_image", title: "Sabji Haat", description: "Vegetables from the farm to the wholesale market." },
};

const themeScript = `try{var raw=localStorage.getItem("vm-ui");var theme=raw?JSON.parse(raw).state.theme:"light";var dark=theme==="dark"||(theme==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);if(dark)document.documentElement.classList.add("dark");}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} className={font.variable} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2F7D32" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
