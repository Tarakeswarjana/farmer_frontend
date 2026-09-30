"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { CropCard, ListingCard, MarketCard, PriceCard } from "@/components/marketplace/cards";
import { ListSkeleton } from "@/components/ui/skeleton";
import { listingsApi } from "@/lib/api/listings";
import { marketPricesApi } from "@/lib/api/marketPrices";
import { marketsApi } from "@/lib/api/markets";
import { queryKeys } from "@/lib/query/client";
import { useCatalog } from "@/hooks/use-catalog";

export function HomePage() {
  const t = useTranslations("public");
  const common = useTranslations("common");
  const catalog = useCatalog();
  const prices = useQuery({ queryKey: queryKeys.prices({ home: true }), queryFn: ({ signal }) => marketPricesApi.list({ limit: 6 }, signal) });
  return (
    <div className="space-y-8">
      <section className="card bg-brand-light p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-dark">{common("appName")}</p>
        <h1 className="mt-2 text-4xl font-bold leading-tight">{t("hero")}</h1>
        <p className="mt-3 max-w-2xl text-lg">{t("heroBody")}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/auth/register" className="inline-flex min-h-14 items-center rounded-2xl bg-brand px-5 text-lg font-bold text-white">{common("createAccount")}</Link>
          <Link href="/listings" className="inline-flex min-h-14 items-center rounded-2xl border border-line bg-surface px-5 text-lg font-bold">{t("browse")}</Link>
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-2xl font-bold">{t("how")}</h2>
        <ol className="grid gap-3 md:grid-cols-4">
          {[t("step1"), t("step2"), t("step3"), t("step4")].map((step, index) => (
            <li key={step} className="card p-4"><span className="text-2xl font-bold text-brand">{index + 1}</span><p className="mt-2 font-semibold">{step}</p></li>
          ))}
        </ol>
      </section>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {catalog.crops.data?.items.slice(0, 8).map((crop) => <CropCard key={crop._id} crop={crop} locale={catalog.locale} onSelect={() => { window.location.href = `/vegetables/${crop._id}`; }} />)}
      </section>
      <section className="space-y-2">
        <h2 className="text-2xl font-bold">{common("prices")}</h2>
        {prices.isLoading ? <ListSkeleton /> : prices.data?.items.map((price) => (
          <PriceCard key={price._id} market={`${catalog.label(price.cropId)} · ${catalog.marketById(price.marketId)?.name ?? ""}`} min={price.minimumPrice} max={price.maximumPrice} modal={price.modalPrice} />
        ))}
      </section>
    </div>
  );
}

export function VegetableDirectory() {
  const catalog = useCatalog();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {catalog.crops.data?.items.map((crop) => <CropCard key={crop._id} crop={crop} locale={catalog.locale} onSelect={() => { window.location.href = `/vegetables/${crop._id}`; }} />)}
    </div>
  );
}

export function VegetableDetail({ id }: { id: string }) {
  const catalog = useCatalog();
  const listings = useQuery({ queryKey: queryKeys.listings({ cropId: id, public: true }), queryFn: ({ signal }) => listingsApi.search({ cropId: id, status: "ACTIVE", limit: 20 }, signal) });
  const crop = catalog.cropById(id);
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">{catalog.label(id) || crop?.name}</h1>
      <p className="text-muted">{crop?.category} · {crop?.season}</p>
      {listings.data?.items.map((listing) => <ListingCard key={listing._id} listing={listing} crop={crop} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/listings/${listing._id}`} />)}
    </div>
  );
}

export function MarketDirectory() {
  const query = useQuery({ queryKey: queryKeys.markets({ public: true }), queryFn: ({ signal }) => marketsApi.list({ limit: 50 }, signal) });
  return <div className="grid gap-3 md:grid-cols-2">{query.data?.items.map((market) => <MarketCard key={market._id} market={market} href={`/markets/${market._id}`} />)}</div>;
}

export function MarketDetail({ id }: { id: string }) {
  const market = useQuery({ queryKey: ["market", id], queryFn: ({ signal }) => marketsApi.get(id, signal) });
  const prices = useQuery({ queryKey: ["market-prices", id], queryFn: ({ signal }) => marketsApi.prices(id, { limit: 20 }, signal) });
  const catalog = useCatalog();
  return (
    <div className="space-y-3">
      <h1 className="text-3xl font-bold">{market.data?.name}</h1>
      <p>{market.data?.address}</p>
      {prices.data?.items.map((price) => <PriceCard key={price._id} market={catalog.label(price.cropId)} min={price.minimumPrice} max={price.maximumPrice} modal={price.modalPrice} />)}
    </div>
  );
}

export function PublicListings() {
  const catalog = useCatalog();
  const query = useQuery({ queryKey: queryKeys.listings({ public: true }), queryFn: ({ signal }) => listingsApi.getListings({ status: "ACTIVE", limit: 20 }, signal) });
  return <div className="grid gap-3 md:grid-cols-2">{query.data?.items.map((listing) => <ListingCard key={listing._id} listing={listing} crop={catalog.cropById(listing.cropId)} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/listings/${listing._id}`} />)}</div>;
}

export function PublicListing({ id }: { id: string }) {
  const catalog = useCatalog();
  const query = useQuery({ queryKey: queryKeys.listing(id), queryFn: ({ signal }) => listingsApi.getListing(id, signal) });
  if (!query.data) return <ListSkeleton />;
  return <ListingCard listing={query.data} crop={catalog.cropById(query.data.cropId)} market={catalog.marketById(query.data.preferredMarketId)} locale={catalog.locale} href={`/auth/login?next=/buyer/marketplace/${id}`} />;
}

export function AboutPage() {
  const t = useTranslations("public");
  return (
    <article className="card space-y-3 p-6">
      <h1 className="text-3xl font-bold">{t("how")}</h1>
      <p>{t("heroBody")}</p>
      <p>Farmers publish supply. Buyers compare mandi prices and either bid or buy. Accepting an offer creates an order. Payment is confirmed by the server. A transporter can then move the vegetables.</p>
    </article>
  );
}
