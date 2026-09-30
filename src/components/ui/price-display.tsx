import { formatRupees } from "@/lib/utils/format";

export function PriceDisplay({ amount, unit }: { amount: number | null | undefined; unit?: string | null }) {
  return (
    <p className="text-2xl font-bold tracking-tight text-ink">
      {formatRupees(amount)}
      {unit ? <span className="ml-1 text-base font-semibold text-muted">/ {unit}</span> : null}
    </p>
  );
}
