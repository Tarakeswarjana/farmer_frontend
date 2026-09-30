"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { QuantityInput } from "@/components/ui/quantity-input";
import { SearchBar } from "@/components/ui/search-bar";
import { ListSkeleton } from "@/components/ui/skeleton";
import { CropCard, ListingCard, PriceCard } from "@/components/marketplace/cards";
import { MapView } from "@/components/maps/map-view";
import { QueryView } from "@/components/common/query-view";
import { OrderDetail } from "@/features/orders/detail";
import { listingsApi } from "@/lib/api/listings";
import { marketPricesApi } from "@/lib/api/marketPrices";
import { matchingApi } from "@/lib/api/matching";
import { ordersApi } from "@/lib/api/orders";
import { requirementsApi } from "@/lib/api/requirements";
import { buyersApi } from "@/lib/api/buyers";
import { conversationsApi } from "@/lib/api/conversations";
import { isApiError } from "@/lib/api/errors";
import { analytics } from "@/lib/monitoring/analytics";
import { explainSupplyMatch } from "@/lib/matching/explain";
import { pointToMarker } from "@/lib/maps/cluster";
import { queryKeys } from "@/lib/query/client";
import { assertOnline, formatRupees, sanitizeText } from "@/lib/utils/format";
import { useCatalog } from "@/hooks/use-catalog";
import { useAuthStore } from "@/stores/auth-store";
import { useFavoriteStore } from "@/stores/ui-store";
import type { ListingQuery, PaymentMethod, Unit } from "@/types/api";
import { useRouter } from "next/navigation";

function fail(error: unknown) {
  toast.error(isApiError(error) ? error.message : error instanceof Error ? error.message : "Something went wrong");
}

export function BuyerDashboard() {
  const t = useTranslations("buyer");
  const common = useTranslations("common");
  const user = useAuthStore((state) => state.user);
  const catalog = useCatalog();
  const prices = useQuery({
    queryKey: queryKeys.prices({ dash: true }),
    queryFn: ({ signal }) => marketPricesApi.list({ from: format(subDays(new Date(), 1), "yyyy-MM-dd"), limit: 12 }, signal),
  });
  const supply = useQuery({
    queryKey: queryKeys.listings({ recommended: true }),
    queryFn: ({ signal }) => listingsApi.search({ status: "ACTIVE", limit: 6, sortBy: "createdAt" }, signal),
  });
  const grouped = prices.data?.items ?? [];
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">{common("greeting", { name: user?.name ?? "" })}</h1>
      <p className="text-xl">{t("need")}</p>
      <Link href="/buyer/marketplace" className="flex min-h-14 items-center rounded-2xl border border-line bg-surface px-4 text-lg font-semibold">{t("searchVeg")}</Link>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {catalog.crops.data?.items.slice(0, 5).map((crop) => (
          <CropCard key={crop._id} crop={crop} locale={catalog.locale} onSelect={() => { window.location.href = `/buyer/marketplace?cropId=${crop._id}`; }} />
        ))}
      </div>
      <section className="space-y-2">
        <h2 className="text-xl font-bold">{common("prices")}</h2>
        {grouped.slice(0, 6).map((price) => (
          <PriceCard key={price._id} market={`${catalog.label(price.cropId)} · ${catalog.marketById(price.marketId)?.name ?? ""}`} min={price.minimumPrice} max={price.maximumPrice} modal={price.modalPrice} />
        ))}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("recommended")}</h2>
        {supply.isLoading ? <ListSkeleton /> : supply.data?.items.map((listing) => (
          <ListingCard key={listing._id} listing={listing} crop={catalog.cropById(listing.cropId)} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/buyer/marketplace/${listing._id}`} />
        ))}
      </section>
    </div>
  );
}

export function Marketplace({ initialCropId }: { initialCropId?: string }) {
  const t = useTranslations("buyer");
  const common = useTranslations("common");
  const catalog = useCatalog();
  const [q, setQ] = useState("");
  const [cropId, setCropId] = useState(initialCropId ?? "");
  const [marketId, setMarketId] = useState("");
  const [quality, setQuality] = useState<"" | "A" | "B" | "C">("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [sort, setSort] = useState("newest");
  const [open, setOpen] = useState(false);
  const filters: ListingQuery = {
    q: q || undefined,
    cropId: cropId || undefined,
    marketId: marketId || undefined,
    quality: quality || undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minQuantity: minQuantity ? Number(minQuantity) : undefined,
    status: "ACTIVE",
    limit: 20,
    sortBy: sort === "lowestPrice" ? "expectedPrice" : sort === "highestQty" ? "quantity" : "createdAt",
    sortOrder: sort === "lowestPrice" ? "asc" : "desc",
  };
  const query = useQuery({ queryKey: queryKeys.listings(filters), queryFn: ({ signal }) => listingsApi.search(filters, signal) });
  const markers = (query.data?.items ?? []).map((listing) => pointToMarker(listing._id, catalog.label(listing.cropId), "listing", listing.location)).filter((item) => item !== null);
  return (
    <div className="space-y-4">
      <PageHeader title={common("market")} />
      <SearchBar label={t("searchVeg")} placeholder={t("searchVeg")} value={q} onChange={setQ} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="min-h-12 rounded-full border border-line px-4 font-semibold" onClick={() => setOpen((value) => !value)}>{common("filter")}</button>
        <select aria-label={common("sort")} className="min-h-12 rounded-full border border-line bg-surface px-3" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">{common("newest")}</option>
          <option value="lowestPrice">{common("lowestPrice")}</option>
          <option value="highestQty">{common("highestQty")}</option>
        </select>
      </div>
      {open ? (
        <div className="card grid gap-3 p-4 md:grid-cols-2">
          <select aria-label={common("crops")} className="min-h-12 rounded-2xl border border-line px-3" value={cropId} onChange={(event) => setCropId(event.target.value)}>
            <option value="">{common("all")}</option>
            {catalog.crops.data?.items.map((crop) => <option key={crop._id} value={crop._id}>{catalog.label(crop._id)}</option>)}
          </select>
          <select aria-label={common("market")} className="min-h-12 rounded-2xl border border-line px-3" value={marketId} onChange={(event) => setMarketId(event.target.value)}>
            <option value="">{common("all")}</option>
            {catalog.markets.data?.items.map((market) => <option key={market._id} value={market._id}>{market.name}</option>)}
          </select>
          <select aria-label={common("quality")} className="min-h-12 rounded-2xl border border-line px-3" value={quality} onChange={(event) => setQuality(event.target.value as "" | "A" | "B" | "C")}>
            <option value="">{common("quality")}</option>
            <option>A</option><option>B</option><option>C</option>
          </select>
          <input className="min-h-12 rounded-2xl border border-line px-3" placeholder={common("price")} inputMode="decimal" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} aria-label={common("max")} />
          <input className="min-h-12 rounded-2xl border border-line px-3" placeholder={common("quantity")} inputMode="numeric" value={minQuantity} onChange={(event) => setMinQuantity(event.target.value)} aria-label={common("quantity")} />
        </div>
      ) : null}
      <MapView markers={markers} title={t("recommended")} />
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={t("emptyMatch")} action={<Link href="/buyer/requirements/new" className="font-bold text-brand-dark">{t("createNeed")}</Link>} />}>
        {(data) => <div className="grid gap-3 md:grid-cols-2">{data.items.map((listing) => <ListingCard key={listing._id} listing={listing} crop={catalog.cropById(listing.cropId)} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/buyer/marketplace/${listing._id}`} />)}</div>}
      </QueryView>
    </div>
  );
}

export function ListingDetail({ id }: { id: string }) {
  const t = useTranslations("buyer");
  const common = useTranslations("common");
  const router = useRouter();
  const catalog = useCatalog();
  const favorites = useFavoriteStore();
  const query = useQuery({
    queryKey: queryKeys.listing(id),
    queryFn: async ({ signal }) => {
      const listing = await listingsApi.getListing(id, signal);
      analytics.track("LISTING_VIEWED", { id });
      return listing;
    },
  });
  const [quantity, setQuantity] = useState(100);
  const [offerPrice, setOfferPrice] = useState(0);
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState<"view" | "offer" | "buy">("view");
  const [step, setStep] = useState(0);
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [address, setAddress] = useState("");
  const [transport, setTransport] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [pickupDate, setPickupDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const offer = useMutation({
    mutationFn: () => {
      assertOnline();
      const listing = query.data;
      if (!listing) throw new Error("Missing listing");
      if (quantity > listing.availableQuantity) throw new Error(common("quantity"));
      return listingsApi.createOffer(id, { offeredPrice: offerPrice || listing.expectedPrice || 0, quantity, message });
    },
    onSuccess: () => { analytics.track("OFFER_CREATED"); toast.success(common("success")); setMode("view"); },
    onError: fail,
  });

  const buy = useMutation({
    mutationFn: async () => {
      assertOnline();
      const listing = query.data;
      if (!listing) throw new Error("Missing listing");
      if (quantity > listing.availableQuantity) throw new Error(common("quantity"));
      const order = await ordersApi.create({
        listingId: id,
        quantity,
        transportCharge: transport,
        scheduledPickupDate: new Date(`${pickupDate}T06:00:00`).toISOString(),
        deliveryLocation: fulfillment === "DELIVERY" ? { address } : undefined,
      });
      analytics.track("ORDER_CREATED", { order: order.orderNumber ?? order._id });
      return order;
    },
    onSuccess: (order) => router.push(`/buyer/orders/${order._id}?pay=1&method=${method}`),
    onError: fail,
  });

  return (
    <QueryView query={query} skeleton={<ListSkeleton />}>
      {(listing) => {
        const marker = pointToMarker(listing._id, catalog.label(listing.cropId), "listing", listing.location);
        const estimate = quantity * (listing.expectedPrice ?? 0) + transport;
        return (
          <div className="space-y-4">
            <ListingCard listing={listing} crop={catalog.cropById(listing.cropId)} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/buyer/marketplace/${listing._id}`} />
            <p>{sanitizeText(listing.description)}</p>
            {marker ? <MapView markers={[marker]} /> : null}
            <div className="grid grid-cols-2 gap-2">
              <Button size="lg" onClick={() => { setMode("offer"); setOfferPrice(listing.expectedPrice ?? 0); setQuantity(Math.min(listing.availableQuantity, quantity)); }}>{t("makeOffer")}</Button>
              <Button size="lg" variant="earth" onClick={() => setMode("buy")}>{t("buyNow")}</Button>
              <Button variant="secondary" onClick={async () => {
                const conversation = await conversationsApi.create({ participantId: listing.farmerId, listingId: listing._id });
                router.push(`/messages/${conversation._id}`);
              }}>{t("chatFarmer")}</Button>
              <Button variant="secondary" onClick={() => favorites.toggle(listing._id)}>{favorites.has(listing._id) ? common("saved") : t("save")}</Button>
            </div>
            {mode === "offer" ? (
              <form className="card space-y-3 p-4" onSubmit={(event) => { event.preventDefault(); offer.mutate(); }}>
                <p>{common("available")} {listing.availableQuantity} {listing.unit}</p>
                <p>{t("sellerPrice")}: {formatRupees(listing.expectedPrice)}</p>
                <QuantityInput label={t("yourQty")} value={quantity} onChange={setQuantity} />
                <label className="block font-semibold">{t("yourOffer")}<input className="mt-1 min-h-14 w-full rounded-2xl border border-line px-3 text-2xl font-bold" value={offerPrice} onChange={(event) => setOfferPrice(Number(event.target.value))} /></label>
                <textarea className="min-h-24 w-full rounded-2xl border border-line p-3" placeholder={common("optional")} value={message} onChange={(event) => setMessage(event.target.value)} />
                {offer.isError ? <p role="alert" className="text-danger">{isApiError(offer.error) ? offer.error.message : ""}</p> : null}
                <Button size="lg" disabled={offer.isPending}>{offer.isPending ? common("saving") : t("sendOffer")}</Button>
              </form>
            ) : null}
            {mode === "buy" ? (
              <div className="card space-y-3 p-4">
                <h2 className="text-xl font-bold">{t("checkout")}</h2>
                {step === 0 ? <QuantityInput label={t("stepQty")} value={quantity} onChange={setQuantity} /> : null}
                {step === 1 ? (
                  <div className="space-y-2">
                    <button type="button" className={`min-h-14 w-full rounded-2xl border ${fulfillment === "PICKUP" ? "bg-brand-light" : ""}`} onClick={() => setFulfillment("PICKUP")}>{common("pickup")}</button>
                    <button type="button" className={`min-h-14 w-full rounded-2xl border ${fulfillment === "DELIVERY" ? "bg-brand-light" : ""}`} onClick={() => setFulfillment("DELIVERY")}>{common("delivery")}</button>
                    {fulfillment === "DELIVERY" ? <input className="min-h-14 w-full rounded-2xl border border-line px-3" value={address} onChange={(event) => setAddress(event.target.value)} placeholder={common("address")} /> : null}
                    <input type="date" className="min-h-14 w-full rounded-2xl border border-line px-3" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} />
                  </div>
                ) : null}
                {step === 2 ? <label className="block font-semibold">{common("transport")}<input className="mt-1 min-h-14 w-full rounded-2xl border border-line px-3" inputMode="decimal" value={transport} onChange={(event) => setTransport(Number(event.target.value))} /></label> : null}
                {step === 3 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {(["CASH", "UPI", "BANK_TRANSFER", "RAZORPAY"] as PaymentMethod[]).map((item) => (
                      <button key={item} type="button" className={`min-h-14 rounded-2xl border font-semibold ${method === item ? "bg-brand text-white" : ""}`} onClick={() => setMethod(item)}>{item}</button>
                    ))}
                  </div>
                ) : null}
                {step === 4 ? (
                  <div className="space-y-1 text-lg">
                    <p>{catalog.label(listing.cropId)} {quantity} × {formatRupees(listing.expectedPrice)}</p>
                    <p>{common("transport")} {formatRupees(transport)}</p>
                    <p className="text-sm text-muted">{common("commission")} is calculated by the server after the order is created.</p>
                    <p className="text-2xl font-bold">{common("total")} {formatRupees(estimate)}</p>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  {step > 0 ? <Button variant="secondary" type="button" onClick={() => setStep((value) => value - 1)}>{common("back")}</Button> : null}
                  {step < 4 ? <Button className="flex-1" type="button" onClick={() => setStep((value) => value + 1)}>{common("next")}</Button> : <Button className="flex-1" disabled={buy.isPending} onClick={() => buy.mutate()}>{buy.isPending ? common("saving") : t("buyNow")}</Button>}
                </div>
              </div>
            ) : null}
          </div>
        );
      }}
    </QueryView>
  );
}

export function RequirementWizard() {
  const t = useTranslations("buyer");
  const common = useTranslations("common");
  const catalog = useCatalog();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [cropId, setCropId] = useState("");
  const [quantity, setQuantity] = useState(1000);
  const [unit, setUnit] = useState<Unit>("KG");
  const [price, setPrice] = useState(30);
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [marketId, setMarketId] = useState("");
  const mutation = useMutation({
    mutationFn: () => requirementsApi.create({ cropId, quantity, unit, targetPrice: price, requiredDate: date, marketId: marketId || undefined }),
    onSuccess: (requirement) => router.push(`/buyer/requirements/${requirement._id}`),
    onError: fail,
  });
  return (
    <div className="space-y-4">
      <PageHeader title={t("requirement")} />
      {step === 0 ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{catalog.crops.data?.items.map((crop) => <CropCard key={crop._id} crop={crop} locale={catalog.locale} selected={cropId === crop._id} onSelect={() => setCropId(crop._id)} />)}</div> : null}
      {step === 1 ? <QuantityInput label={common("quantity")} value={quantity} unit={unit} onUnit={(value) => setUnit(value as Unit)} units={["KG", "QUINTAL", "TONNE", "PIECE", "BUNDLE", "CRATE"]} onChange={setQuantity} /> : null}
      {step === 2 ? <input className="min-h-14 w-full rounded-2xl border border-line px-3 text-3xl font-bold" inputMode="decimal" value={price} onChange={(event) => setPrice(Number(event.target.value))} aria-label={common("price")} /> : null}
      {step === 3 ? <input type="date" className="min-h-14 w-full rounded-2xl border border-line px-3" value={date} onChange={(event) => setDate(event.target.value)} /> : null}
      {step === 4 ? catalog.markets.data?.items.map((market) => <button key={market._id} type="button" className={`mb-2 min-h-14 w-full rounded-2xl border text-left px-4 font-semibold ${marketId === market._id ? "bg-brand-light" : ""}`} onClick={() => setMarketId(market._id)}>{market.name}</button>) : null}
      <div className="flex gap-2">
        {step > 0 ? <Button variant="secondary" type="button" onClick={() => setStep((value) => value - 1)}>{common("back")}</Button> : null}
        {step < 4 ? <Button className="flex-1" type="button" disabled={step === 0 && !cropId} onClick={() => setStep((value) => value + 1)}>{common("next")}</Button> : <Button className="flex-1" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? t("finding") : common("submit")}</Button>}
      </div>
    </div>
  );
}

export function RequirementMatches({ id }: { id: string }) {
  const t = useTranslations("buyer");
  const common = useTranslations("common");
  const catalog = useCatalog();
  const requirement = useQuery({ queryKey: ["requirement", id], queryFn: ({ signal }) => requirementsApi.get(id, signal) });
  const matches = useQuery({ queryKey: queryKeys.matches, queryFn: ({ signal }) => matchingApi.mine(signal) });
  const profile = useQuery({ queryKey: queryKeys.buyerProfile, queryFn: ({ signal }) => buyersApi.myProfile(signal) });
  const bundle = matches.data?.buyerMatches.find((item) => item.requirement._id === id);
  const origin = profile.data?.location?.coordinates ? { lng: profile.data.location.coordinates[0] ?? 0, lat: profile.data.location.coordinates[1] ?? 0 } : null;
  if (requirement.isLoading || matches.isLoading) return <ListSkeleton />;
  return (
    <div className="space-y-4">
      <PageHeader title={t("matches")} subtitle={common("matchNote")} />
      <p className="text-lg font-semibold">{bundle?.matchingListings.length ?? 0}</p>
      {(bundle?.matchingListings ?? []).map((listing) => {
        const checks = requirement.data ? explainSupplyMatch(requirement.data, listing, origin) : [];
        const strong = checks.every((check) => check.ok);
        return (
          <article key={listing._id} className="card space-y-2 p-4">
            <p className="font-bold text-brand-dark">{strong ? t("strong") : t("partial")}</p>
            <ListingCard listing={listing} crop={catalog.cropById(listing.cropId)} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/buyer/marketplace/${listing._id}`} />
            <ul className="text-sm">
              {checks.map((check) => <li key={check.key}>{check.ok ? "✓" : "•"} {t(check.key === "sameCrop" ? "sameCrop" : check.key === "quantity" ? "qtyOk" : check.key === "price" ? "priceOk" : "nearby")}</li>)}
            </ul>
          </article>
        );
      })}
      {!bundle?.matchingListings.length ? <EmptyState title={t("emptyMatch")} action={<Link href="/buyer/requirements/new" className="font-bold">{t("createNeed")}</Link>} /> : null}
    </div>
  );
}

export function RequirementList() {
  const t = useTranslations("buyer");
  const catalog = useCatalog();
  const query = useQuery({ queryKey: queryKeys.requirements({ mine: true }), queryFn: ({ signal }) => requirementsApi.list({ mine: true, limit: 20 }, signal) });
  return (
    <div className="space-y-4">
      <PageHeader title={t("requirement")} action={<Link href="/buyer/requirements/new" className="rounded-2xl bg-brand px-4 py-3 font-bold text-white">+</Link>} />
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={t("emptyMatch")} action={<Link href="/buyer/requirements/new">{t("createNeed")}</Link>} />}>
        {(data) => data.items.map((item) => (
          <Link key={item._id} href={`/buyer/requirements/${item._id}`} className="card mb-3 block p-4">
            <p className="text-xl font-bold">{catalog.label(item.cropId)}</p>
            <p>{item.quantity} {item.unit} · {formatRupees(item.targetPrice)}</p>
            <p className="text-sm">{item.status}</p>
          </Link>
        ))}
      </QueryView>
    </div>
  );
}

export function BuyerOrders() {
  const common = useTranslations("common");
  const catalog = useCatalog();
  const query = useQuery({ queryKey: queryKeys.orders({ buyer: true }), queryFn: ({ signal }) => ordersApi.list({ limit: 20 }, signal) });
  return (
    <div className="space-y-3">
      <PageHeader title={common("orders")} />
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={common("orders")} />}>
        {(data) => data.items.map((order) => <div key={order._id} className="mb-3"><ListingLink orderId={order._id} title={catalog.label(order.cropId)} /></div>)}
      </QueryView>
    </div>
  );
}

function ListingLink({ orderId, title }: { orderId: string; title: string }) {
  return <Link href={`/buyer/orders/${orderId}`} className="card block p-4 font-bold">{title}</Link>;
}

export function BuyerOrder({ id }: { id: string }) {
  return <OrderDetail id={id} hrefBase="/buyer/orders" />;
}

export function Favorites() {
  const common = useTranslations("common");
  const ids = useFavoriteStore((state) => state.listingIds);
  const catalog = useCatalog();
  const query = useQuery({
    queryKey: ["favorites", ids],
    queryFn: () => Promise.all(ids.map((id) => listingsApi.getListing(id).catch(() => null))),
  });
  return (
    <div className="space-y-3">
      <PageHeader title={common("favorites")} subtitle={common("favoritesNote")} />
      {query.isLoading ? <ListSkeleton /> : null}
      {query.data?.filter((item) => item).map((listing) => listing ? <ListingCard key={listing._id} listing={listing} crop={catalog.cropById(listing.cropId)} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/buyer/marketplace/${listing._id}`} /> : null)}
      {!ids.length ? <EmptyState title={common("noResults")} /> : null}
    </div>
  );
}

export function BuyerOffers() {
  const common = useTranslations("common");
  const query = useQuery({ queryKey: queryKeys.offersMine({}), queryFn: ({ signal }) => import("@/lib/api/offers").then((mod) => mod.offersApi.mine({ limit: 20 }, signal)) });
  return (
    <div className="space-y-3">
      <PageHeader title={common("offers")} />
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={common("offers")} />}>
        {(data) => data.items.map((offer) => <article key={offer._id} className="card p-4">{offer.quantity} · {formatRupees(offer.offeredPrice)} · {offer.status}</article>)}
      </QueryView>
    </div>
  );
}

export function PriceBoard() {
  const common = useTranslations("common");
  const catalog = useCatalog();
  const [cropId, setCropId] = useState("");
  const [range, setRange] = useState("today");
  const from = range === "today" ? format(new Date(), "yyyy-MM-dd") : range === "yesterday" ? format(subDays(new Date(), 1), "yyyy-MM-dd") : range === "week" ? format(subDays(new Date(), 7), "yyyy-MM-dd") : format(subDays(new Date(), 30), "yyyy-MM-dd");
  const query = useQuery({
    queryKey: queryKeys.prices({ cropId, from }),
    queryFn: ({ signal }) => (cropId ? marketPricesApi.byCrop(cropId, { from, limit: 100 }, signal) : marketPricesApi.list({ from, limit: 100 }, signal)),
  });
  const chart = (query.data?.items ?? []).map((price) => ({ name: catalog.marketById(price.marketId)?.name ?? "", modal: price.modalPrice ?? 0 }));
  return (
    <div className="space-y-4">
      <PageHeader title={common("prices")} />
      <div className="flex flex-wrap gap-2">
        <select aria-label={common("crops")} className="min-h-12 rounded-2xl border border-line px-3" value={cropId} onChange={(event) => setCropId(event.target.value)}>
          <option value="">{common("all")}</option>
          {catalog.crops.data?.items.map((crop) => <option key={crop._id} value={crop._id}>{catalog.label(crop._id)}</option>)}
        </select>
        {(["today", "yesterday", "week", "month"] as const).map((item) => (
          <button key={item} type="button" className={`min-h-12 rounded-full px-4 font-semibold ${range === item ? "bg-brand text-white" : "border border-line"}`} onClick={() => setRange(item)}>{common(item)}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 px-2 text-sm font-semibold text-muted"><span>{common("market")}</span><span>{common("min")}</span><span>{common("max")}</span><span>{common("modal")}</span></div>
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={common("noResults")} />}>
        {(data) => data.items.map((price) => <PriceCard key={price._id} market={catalog.marketById(price.marketId)?.name ?? price.marketId} min={price.minimumPrice} max={price.maximumPrice} modal={price.modalPrice} />)}
      </QueryView>
      <div className="card h-64 p-3">
        <MapChart data={chart} />
      </div>
    </div>
  );
}

function MapChart({ data }: { data: Array<{ name: string; modal: number }> }) {
  if (!data.length) return <p className="text-sm text-muted">—</p>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis dataKey="name" hide />
        <YAxis />
        <Tooltip />
        <Bar dataKey="modal" fill="#2F7D32" radius={6} />
      </BarChart>
    </ResponsiveContainer>
  );
}
