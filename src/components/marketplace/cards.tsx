"use client";

import Link from "next/link";
import { cropEmoji, formatNumber, formatRupees, sanitizeText } from "@/lib/utils/format";
import { distanceLabel } from "@/lib/matching/explain";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Crop, Listing, Market, Offer, Order } from "@/types/api";

export function cropLabel(crop: Crop | undefined, locale: string) {
  if (!crop) return "";
  if (locale === "bn" && crop.bengaliName) return crop.bengaliName;
  return crop.name ?? "";
}

export function CropCard({ crop, locale, selected, onSelect }: { crop: Crop; locale: string; selected?: boolean; onSelect?: () => void }) {
  const label = cropLabel(crop, locale);
  return (
    <button type="button" onClick={onSelect} className={`card flex min-h-28 flex-col items-center justify-center gap-1 p-3 text-center ${selected ? "ring-4 ring-brand" : ""}`}>
      <span className="text-4xl" aria-hidden>{cropEmoji(crop.name)}</span>
      <span className="text-lg font-bold">{label}</span>
    </button>
  );
}

export function ListingCard({
  listing,
  crop,
  market,
  locale,
  href,
  offers,
}: {
  listing: Listing;
  crop?: Crop;
  market?: Market;
  locale: string;
  href: string;
  offers?: number;
}) {
  const name = cropLabel(crop, locale) || sanitizeText(listing.title);
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold">
          <span aria-hidden>{cropEmoji(crop?.name)} </span>
          {name}
        </h3>
        <StatusBadge status={listing.status} />
      </div>
      <p className="mt-2 text-lg">{formatNumber(listing.availableQuantity)} {listing.unit}</p>
      <p className="text-2xl font-bold">{formatRupees(listing.expectedPrice)} <span className="text-base font-semibold text-muted">/ {listing.unit}</span></p>
      <p className="text-muted">{market?.name ?? listing.district}</p>
      {listing.distanceMeters != null ? <p className="text-sm">{distanceLabel(listing.distanceMeters)}</p> : null}
      <p className="text-sm">Quality {listing.qualityGrade}</p>
      {offers != null ? <p className="text-sm font-semibold">{offers} offers</p> : null}
      <Link href={href} className="mt-3 inline-flex min-h-touch items-center font-semibold text-brand-dark underline">
        View
      </Link>
    </article>
  );
}

export function MarketCard({ market, href }: { market: Market; href?: string }) {
  const body = (
    <article className="card p-4">
      <h3 className="text-lg font-bold">{market.name}</h3>
      <p className="text-muted">{market.district}</p>
      <p className="text-sm">{market.marketType}</p>
    </article>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function OfferCard({ offer, title, buyerName, actions }: { offer: Offer; title: string; buyerName?: string; actions?: React.ReactNode }) {
  return (
    <article className="card space-y-2 p-4">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-lg">{formatNumber(offer.quantity)} · {formatRupees(offer.offeredPrice)}</p>
      {buyerName ? <p>{buyerName}</p> : null}
      <StatusBadge status={offer.status} />
      {offer.message ? <p className="text-muted">{sanitizeText(offer.message)}</p> : null}
      {actions}
    </article>
  );
}

export function OrderCard({ order, title, href }: { order: Order; title: string; href: string }) {
  return (
    <article className="card space-y-1 p-4">
      <p className="font-mono text-sm">{order.orderNumber}</p>
      <h3 className="text-xl font-bold">{title}</h3>
      <p>{formatNumber(order.quantity)} {order.unit} · {formatRupees(order.unitPrice)}</p>
      <p className="text-2xl font-bold">{formatRupees(order.totalAmount)}</p>
      <StatusBadge status={order.orderStatus} />
      <Link href={href} className="inline-flex min-h-touch items-center font-semibold text-brand-dark underline">View</Link>
    </article>
  );
}

export function PriceCard({ market, min, max, modal }: { market: string; min: number | null; max: number | null; modal: number | null }) {
  return (
    <article className="card grid grid-cols-4 items-center gap-2 p-4 text-sm md:text-base">
      <h3 className="font-bold">{market}</h3>
      <p>{formatRupees(min)}</p>
      <p>{formatRupees(max)}</p>
      <p className="font-bold">{formatRupees(modal)}</p>
    </article>
  );
}
