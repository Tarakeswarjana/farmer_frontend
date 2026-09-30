"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function DesktopSidebar({ items }: { items: Array<{ href: string; label: string }> }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-auto border-r border-line bg-surface p-4 lg:block">
      <p className="mb-4 px-2 text-lg font-bold text-brand-dark">Sabji Haat</p>
      <nav aria-label="Admin">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link href={item.href} className={cn("block rounded-xl px-3 py-2 font-medium", active ? "bg-brand-light text-brand-dark" : "hover:bg-brand-light/60")}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
