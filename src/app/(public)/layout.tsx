import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-4">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-xl font-bold text-brand-dark">Sabji Haat</Link>
        <nav className="flex flex-wrap gap-3 text-sm font-semibold" aria-label="Public">
          <Link href="/vegetables">Vegetables</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/markets/prices">Prices</Link>
          <Link href="/listings">Listings</Link>
          <Link href="/about">About</Link>
          <Link href="/auth/login" className="rounded-full bg-brand px-3 py-2 text-white">Sign in</Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
