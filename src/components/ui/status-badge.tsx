import { cn } from "@/lib/utils/cn";

const tones: Record<string, string> = {
  ACTIVE: "bg-brand-light text-brand-dark",
  PARTIALLY_SOLD: "bg-amber-100 text-amber-900",
  SOLD: "bg-emerald-100 text-emerald-900",
  DRAFT: "bg-stone-100 text-stone-800",
  EXPIRED: "bg-stone-200 text-stone-700",
  CANCELLED: "bg-red-100 text-red-800",
  PENDING: "bg-amber-100 text-amber-900",
  CONFIRMED: "bg-brand-light text-brand-dark",
  READY_FOR_PICKUP: "bg-sky-100 text-sky-900",
  PICKED_UP: "bg-sky-100 text-sky-900",
  IN_TRANSIT: "bg-indigo-100 text-indigo-900",
  DELIVERED: "bg-emerald-100 text-emerald-900",
  COMPLETED: "bg-emerald-100 text-emerald-900",
  DISPUTED: "bg-red-100 text-red-800",
  PAID: "bg-emerald-100 text-emerald-900",
  UNPAID: "bg-amber-100 text-amber-900",
  SUCCESS: "bg-emerald-100 text-emerald-900",
  VERIFIED: "bg-brand-light text-brand-dark",
  REJECTED: "bg-red-100 text-red-800",
  ACCEPTED: "bg-emerald-100 text-emerald-900",
  COUNTERED: "bg-amber-100 text-amber-900",
  OPEN: "bg-brand-light text-brand-dark",
  REQUESTED: "bg-amber-100 text-amber-900",
  ASSIGNED: "bg-sky-100 text-sky-900",
};

export function StatusBadge({ status }: { status: string | null | undefined }) {
  const key = status ?? "PENDING";
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-sm font-semibold", tones[key] ?? "bg-stone-100 text-stone-800")}>
      {key.replaceAll("_", " ")}
    </span>
  );
}
