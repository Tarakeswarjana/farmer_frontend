"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, subDays } from "date-fns";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { QuantityInput } from "@/components/ui/quantity-input";
import { DashboardSkeleton, ListSkeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "@/components/forms/image-uploader";
import { CropCard, ListingCard, OfferCard, OrderCard, PriceCard } from "@/components/marketplace/cards";
import { QueryView } from "@/components/common/query-view";
import { farmersApi } from "@/lib/api/farmers";
import { listingsApi } from "@/lib/api/listings";
import { marketPricesApi } from "@/lib/api/marketPrices";
import { offersApi } from "@/lib/api/offers";
import { ordersApi } from "@/lib/api/orders";
import { isApiError } from "@/lib/api/errors";
import { analytics } from "@/lib/monitoring/analytics";
import { queryKeys } from "@/lib/query/client";
import { assertOnline, formatRupees } from "@/lib/utils/format";
import { useCatalog } from "@/hooks/use-catalog";
import { useAuthStore } from "@/stores/auth-store";
import type { ListingStatus, Offer, Unit } from "@/types/api";

const units: Unit[] = ["KG", "QUINTAL", "TONNE", "PIECE", "BUNDLE", "CRATE"];

function fail(error: unknown) {
  toast.error(isApiError(error) ? error.message : "Something went wrong");
}

export function FarmerDashboard() {
  const t = useTranslations("farmer");
  const common = useTranslations("common");
  const user = useAuthStore((state) => state.user);
  const { label, marketById, cropById, locale } = useCatalog();
  const profile = useQuery({ queryKey: queryKeys.farmerProfile, queryFn: ({ signal }) => farmersApi.myProfile(signal) });
  const listings = useQuery({ queryKey: queryKeys.myListings({ status: "ACTIVE" }), queryFn: ({ signal }) => listingsApi.getMyListings({ status: "ACTIVE", limit: 5 }, signal) });
  const offers = useQuery({ queryKey: queryKeys.offersReceived({ status: "PENDING" }), queryFn: ({ signal }) => offersApi.received({ status: "PENDING", limit: 5 }, signal) });
  const orders = useQuery({ queryKey: queryKeys.orders({ status: "PENDING" }), queryFn: ({ signal }) => ordersApi.list({ status: "PENDING", limit: 5 }, signal) });
  const prices = useQuery({
    queryKey: queryKeys.prices({ range: "today" }),
    queryFn: ({ signal }) => marketPricesApi.list({ from: format(new Date(), "yyyy-MM-dd"), limit: 8 }, signal),
  });

  if (listings.isLoading || offers.isLoading || orders.isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">{common("greeting", { name: user?.name ?? t("sell") })}</h1>
      <div className="grid grid-cols-2 gap-3">
        <Stat label={t("totalSales")} value={formatRupees(profile.data?.totalSales ?? 0)} />
        <Stat label={t("activeListings")} value={String(listings.data?.meta.total ?? 0)} />
        <Stat label={t("newOffers")} value={String(offers.data?.meta.total ?? 0)} />
        <Stat label={t("pendingOrders")} value={String(orders.data?.meta.total ?? 0)} />
      </div>
      <Link href="/farmer/listings/new" className="flex min-h-16 items-center justify-center rounded-2xl bg-brand text-xl font-bold text-white">
        + {t("sell")}
      </Link>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("activeListings")}</h2>
        {listings.isError ? <p role="alert">{isApiError(listings.error) ? listings.error.message : ""}</p> : null}
        {listings.data?.items.length ? listings.data.items.map((listing) => (
          <ListingCard key={listing._id} listing={listing} crop={cropById(listing.cropId)} market={marketById(listing.preferredMarketId)} locale={locale} href={`/farmer/listings/${listing._id}`} />
        )) : <EmptyState title={t("emptyListings")} action={<Link className="font-bold text-brand-dark" href="/farmer/listings/new">{t("emptyCta")}</Link>} />}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("recentOffers")}</h2>
        {offers.data?.items.map((offer) => <OfferCard key={offer._id} offer={offer} title={label(offer.listingId) || offer.listingId} />)}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("upcoming")}</h2>
        {orders.data?.items.map((order) => <OrderCard key={order._id} order={order} title={label(order.cropId)} href={`/farmer/orders/${order._id}`} />)}
      </section>
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("todayPrices")}</h2>
        {prices.data?.items.map((price) => (
          <PriceCard key={price._id} market={marketById(price.marketId)?.name ?? price.marketId} min={price.minimumPrice} max={price.maximumPrice} modal={price.modalPrice} />
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-semibold text-muted">{label}</p>
    </div>
  );
}

export function FarmerListings() {
  const t = useTranslations("farmer");
  const common = useTranslations("common");
  const { cropById, marketById, locale } = useCatalog();
  const [tab, setTab] = useState<ListingStatus | "OFFERS">("ACTIVE");
  const status = tab === "OFFERS" ? undefined : tab;
  const query = useQuery({
    queryKey: queryKeys.myListings({ status: tab }),
    queryFn: ({ signal }) => listingsApi.getMyListings({ status, limit: 20 }, signal),
  });
  const tabs: Array<{ id: ListingStatus | "OFFERS"; label: string }> = [
    { id: "ACTIVE", label: common("active") },
    { id: "OFFERS", label: common("offers") },
    { id: "SOLD", label: common("sold") },
    { id: "EXPIRED", label: common("expired") },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title={t("myListings")} action={<Link href="/farmer/listings/new" className="rounded-2xl bg-brand px-4 py-3 font-bold text-white">+ {t("sell")}</Link>} />
      <div className="flex gap-2 overflow-auto">
        {tabs.map((item) => (
          <button key={item.id} type="button" className={`min-h-12 rounded-full px-4 font-semibold ${tab === item.id ? "bg-brand text-white" : "bg-surface border border-line"}`} onClick={() => setTab(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      {tab === "OFFERS" ? <FarmerOffers /> : (
        <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={t("emptyListings")} action={<Link href="/farmer/listings/new" className="font-bold text-brand-dark">{t("emptyCta")}</Link>} />}>
          {(data) => (
            <div className="space-y-3">
              {data.items.map((listing) => (
                <ListingCard key={listing._id} listing={listing} crop={cropById(listing.cropId)} market={marketById(listing.preferredMarketId)} locale={locale} href={`/farmer/listings/${listing._id}`} />
              ))}
            </div>
          )}
        </QueryView>
      )}
    </div>
  );
}

export function ListingWizard({ listingId }: { listingId?: string }) {
  const t = useTranslations("farmer");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const client = useQueryClient();
  const catalog = useCatalog();
  const existing = useQuery({ queryKey: queryKeys.listing(listingId ?? "new"), queryFn: ({ signal }) => listingsApi.getListing(listingId as string, signal), enabled: Boolean(listingId) });
  const profile = useQuery({ queryKey: queryKeys.farmerProfile, queryFn: ({ signal }) => farmersApi.myProfile(signal) });
  const [step, setStep] = useState(0);
  const [cropId, setCropId] = useState("");
  const [quantity, setQuantity] = useState(500);
  const [unit, setUnit] = useState<Unit>("KG");
  const [price, setPrice] = useState(28);
  const [grade, setGrade] = useState<"A" | "B" | "C">("A");
  const [harvest, setHarvest] = useState(format(new Date(), "yyyy-MM-dd"));
  const [marketId, setMarketId] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");

  const crop = catalog.cropById(cropId || existing.data?.cropId);
  const market = catalog.marketById(marketId || existing.data?.preferredMarketId);

  const mutation = useMutation({
    mutationFn: async () => {
      assertOnline();
      const chosenCrop = cropId || existing.data?.cropId;
      if (!chosenCrop) throw new Error(t("which"));
      const point = profile.data?.location?.coordinates;
      const location = point ? { longitude: point[0] ?? 88.729, latitude: point[1] ?? 22.933 } : { longitude: 88.729, latitude: 22.933 };
      const payload = {
        cropId: chosenCrop,
        quantity,
        unit,
        qualityGrade: grade,
        expectedPrice: price,
        harvestDate: harvest,
        availableFrom: new Date(`${harvest}T06:00:00`).toISOString(),
        availableUntil: new Date(`${harvest}T18:00:00`).toISOString(),
        preferredMarketId: marketId || undefined,
        marketId: marketId || undefined,
        district: market?.district ?? profile.data?.district ?? "North 24 Parganas",
        state: "West Bengal",
        location,
        images,
        isNegotiable: true,
        allowBidding: true,
        title: crop?.name ?? undefined,
      };
      if (listingId) return listingsApi.updateListing(listingId, payload);
      const created = await listingsApi.createListing(payload);
      return listingsApi.publishListing(created._id);
    },
    onSuccess: async () => {
      analytics.track("LISTING_CREATED");
      await client.invalidateQueries({ queryKey: ["my-listings"] });
      await client.invalidateQueries({ queryKey: ["listings"] });
      toast.success(common("published"));
      router.push("/farmer/listings");
    },
    onError: (cause) => setError(isApiError(cause) ? cause.message : cause instanceof Error ? cause.message : common("connectionRequired")),
  });

  const steps = [t("which"), t("howMuch"), t("whatPrice"), t("when"), t("whichMarket"), t("addPhoto"), t("preview")];
  const spoken = steps[step] ?? "";

  return (
    <div className="space-y-4">
      <PageHeader title={spoken} subtitle={`${step + 1} / 7`} action={<Speak text={spoken} />} />
      {catalog.crops.isLoading || (listingId && existing.isLoading) ? <ListSkeleton /> : null}
      {step === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {catalog.crops.data?.items.map((item) => (
            <CropCard key={item._id} crop={item} locale={locale} selected={(cropId || existing.data?.cropId) === item._id} onSelect={() => setCropId(item._id)} />
          ))}
        </div>
      ) : null}
      {step === 1 ? <QuantityInput label={t("howMuch")} value={quantity} onChange={setQuantity} unit={unit} onUnit={(value) => setUnit(value as Unit)} units={units} /> : null}
      {step === 2 ? (
        <label className="block text-lg font-semibold">
          ₹
          <input className="ml-2 min-h-14 w-40 rounded-2xl border border-line text-center text-3xl font-bold" inputMode="decimal" value={price} onChange={(event) => setPrice(Number(event.target.value))} />
          <span className="ml-2">/ {unit}</span>
        </label>
      ) : null}
      {step === 3 ? (
        <div className="space-y-3">
          <input type="date" className="min-h-14 w-full rounded-2xl border border-line px-3 text-lg" value={harvest} onChange={(event) => setHarvest(event.target.value)} />
          <div className="flex gap-2">
            {(["A", "B", "C"] as const).map((item) => (
              <button key={item} type="button" className={`min-h-14 flex-1 rounded-2xl font-bold ${grade === item ? "bg-brand text-white" : "border border-line"}`} onClick={() => setGrade(item)}>{item}</button>
            ))}
          </div>
        </div>
      ) : null}
      {step === 4 ? (
        <div className="grid gap-2">
          {catalog.markets.data?.items.map((item) => (
            <button key={item._id} type="button" className={`min-h-14 rounded-2xl border px-4 text-left font-semibold ${marketId === item._id ? "border-brand bg-brand-light" : "border-line"}`} onClick={() => setMarketId(item._id)}>
              {item.name} · {item.district}
            </button>
          ))}
        </div>
      ) : null}
      {step === 5 ? <ImageUploader label={t("addPhoto")} urls={images} onChange={setImages} /> : null}
      {step === 6 ? (
        <div className="card space-y-2 p-5 text-xl">
          <p className="text-3xl font-bold">{catalog.label(cropId || existing.data?.cropId)}</p>
          <p>{quantity} {unit}</p>
          <p className="text-3xl font-bold">{formatRupees(price)} / {unit}</p>
          <p>{market?.name}</p>
          <p className="text-sm text-muted">{common("imagePrivate")}</p>
        </div>
      ) : null}
      {error ? <p role="alert" className="text-danger">{error}</p> : null}
      <div className="flex gap-2">
        {step > 0 ? <Button variant="secondary" type="button" onClick={() => setStep((value) => value - 1)}>{common("back")}</Button> : null}
        {step < 6 ? <Button size="lg" className="flex-1" type="button" disabled={step === 0 && !cropId && !existing.data?.cropId} onClick={() => setStep((value) => value + 1)}>{common("next")}</Button> : (
          <Button size="lg" className="flex-1" type="button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? common("saving") : t("start")}
          </Button>
        )}
      </div>
    </div>
  );
}

function Speak({ text }: { text: string }) {
  const common = useTranslations("common");
  const locale = useLocale();
  return (
    <button type="button" className="text-sm font-semibold text-brand-dark" onClick={() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale === "bn" ? "bn-IN" : "en-IN";
      window.speechSynthesis?.cancel();
      window.speechSynthesis?.speak(utterance);
    }}>{common("voice")}</button>
  );
}

export function ListingManage({ id }: { id: string }) {
  const common = useTranslations("common");
  const client = useQueryClient();
  const catalog = useCatalog();
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: queryKeys.listing(id), queryFn: ({ signal }) => listingsApi.getListing(id, signal) });
  const cancel = useMutation({
    mutationFn: () => listingsApi.cancelListing(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["my-listings"] });
      await client.invalidateQueries({ queryKey: queryKeys.listing(id) });
      toast.success(common("success"));
      setOpen(false);
    },
    onError: fail,
  });
  return (
    <QueryView query={query} skeleton={<DashboardSkeleton />}>
      {(listing) => (
        <div className="space-y-4">
          <ListingCard listing={listing} crop={catalog.cropById(listing.cropId)} market={catalog.marketById(listing.preferredMarketId)} locale={catalog.locale} href={`/farmer/listings/${listing._id}`} />
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/farmer/listings/${id}/edit`} className="flex min-h-14 items-center justify-center rounded-2xl border border-line font-bold">{common("edit")}</Link>
            <button type="button" className="min-h-14 rounded-2xl border border-danger font-bold text-danger" onClick={() => setOpen(true)}>{common("pause")}</button>
            <Link href="/farmer/offers" className="col-span-2 flex min-h-14 items-center justify-center rounded-2xl bg-brand font-bold text-white">{common("offers")}</Link>
          </div>
          <p className="text-sm text-muted">{common("noPause")}</p>
          <ConfirmDialog open={open} title={common("pause")} body={common("noPause")} confirmLabel={common("cancel")} pending={cancel.isPending} onClose={() => setOpen(false)} onConfirm={() => cancel.mutate()} />
        </div>
      )}
    </QueryView>
  );
}

export function FarmerOffers() {
  const t = useTranslations("farmer");
  const common = useTranslations("common");
  const catalog = useCatalog();
  const client = useQueryClient();
  const [counter, setCounter] = useState<Offer | null>(null);
  const [price, setPrice] = useState(32);
  const [quantity, setQuantity] = useState(300);
  const query = useQuery({ queryKey: queryKeys.offersReceived({}), queryFn: ({ signal }) => offersApi.received({ limit: 30 }, signal) });
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ["offers-received"] });
    await client.invalidateQueries({ queryKey: ["orders"] });
    await client.invalidateQueries({ queryKey: ["my-listings"] });
  };
  const accept = useMutation({ mutationFn: offersApi.accept, onSuccess: async () => { analytics.track("OFFER_ACCEPTED"); await refresh(); toast.success(common("success")); }, onError: fail });
  const reject = useMutation({ mutationFn: offersApi.reject, onSuccess: refresh, onError: fail });
  const sendCounter = useMutation({
    mutationFn: () => offersApi.counter(counter?._id ?? "", { offeredPrice: price, quantity }),
    onSuccess: async () => { setCounter(null); await refresh(); toast.success(common("success")); },
    onError: fail,
  });
  return (
    <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={t("recentOffers")} body="" />}>
      {(data) => (
        <div className="space-y-3">
          {data.items.map((offer) => (
            <OfferCard key={offer._id} offer={offer} title={catalog.label(offer.listingId) || offer.quantity + " " } buyerName={offer.buyerId} actions={
              offer.status === "PENDING" || offer.status === "COUNTERED" ? (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <Button onClick={() => accept.mutate(offer._id)} disabled={accept.isPending}>{common("accept")}</Button>
                  <Button variant="secondary" onClick={() => reject.mutate(offer._id)}>{common("reject")}</Button>
                  <Button variant="earth" onClick={() => { setCounter(offer); setPrice(offer.offeredPrice ?? 0); setQuantity(offer.quantity); }}>{common("counter")}</Button>
                </div>
              ) : null
            } />
          ))}
          {counter ? (
            <div className="card space-y-3 p-4">
              <h2 className="text-xl font-bold">{t("counterPrice")}</h2>
              <p>{t("yourPrice")}: {formatRupees(counter.originalPrice)} · {t("buyerOffer")}: {formatRupees(counter.offeredPrice)}</p>
              <input className="min-h-14 w-full rounded-2xl border border-line px-3 text-2xl font-bold" inputMode="decimal" value={price} onChange={(event) => setPrice(Number(event.target.value))} aria-label={t("counterPrice")} />
              <QuantityInput label={common("quantity")} value={quantity} onChange={setQuantity} />
              <Button size="lg" disabled={sendCounter.isPending} onClick={() => sendCounter.mutate()}>{t("sendCounter")}</Button>
            </div>
          ) : null}
        </div>
      )}
    </QueryView>
  );
}

export function FarmerOrders() {
  const common = useTranslations("common");
  const catalog = useCatalog();
  const query = useQuery({ queryKey: queryKeys.orders({ role: "farmer" }), queryFn: ({ signal }) => ordersApi.list({ limit: 20 }, signal) });
  return (
    <div className="space-y-4">
      <PageHeader title={common("orders")} />
      <QueryView query={query} skeleton={<ListSkeleton />} isEmpty={(data) => data.items.length === 0} empty={<EmptyState title={common("orders")} />}>
        {(data) => <div className="space-y-3">{data.items.map((order) => <OrderCard key={order._id} order={order} title={catalog.label(order.cropId)} href={`/farmer/orders/${order._id}`} />)}</div>}
      </QueryView>
    </div>
  );
}

export function FarmerEarnings() {
  const t = useTranslations("farmer");
  const common = useTranslations("common");
  const catalog = useCatalog();
  const profile = useQuery({ queryKey: queryKeys.farmerProfile, queryFn: ({ signal }) => farmersApi.myProfile(signal) });
  const orders = useQuery({ queryKey: queryKeys.orders({ earnings: true }), queryFn: ({ signal }) => ordersApi.list({ limit: 100, sortBy: "createdAt" }, signal) });
  const summary = useMemo(() => {
    const items = orders.data?.items ?? [];
    const monthStart = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const thisMonth = items.filter((order) => (order.createdAt ?? "") >= monthStart && order.orderStatus !== "CANCELLED").reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const pending = items.filter((order) => order.paymentStatus !== "PAID" && order.orderStatus !== "CANCELLED").reduce((sum, order) => sum + (order.totalAmount ?? 0), 0);
    const byDay = new Map<string, number>();
    const byCrop = new Map<string, number>();
    items.forEach((order) => {
      const day = order.createdAt ? format(parseISO(order.createdAt), "MM-dd") : "";
      byDay.set(day, (byDay.get(day) ?? 0) + (order.totalAmount ?? 0));
      byCrop.set(order.cropId, (byCrop.get(order.cropId) ?? 0) + (order.totalAmount ?? 0));
    });
    return {
      thisMonth,
      pending,
      days: [...byDay.entries()].map(([name, sales]) => ({ name, sales })),
      crops: [...byCrop.entries()].map(([id, sales]) => ({ name: catalog.label(id) || id.slice(-4), sales })),
      partial: (orders.data?.meta.total ?? 0) > items.length,
      count: items.length,
      total: orders.data?.meta.total ?? items.length,
    };
  }, [catalog, orders.data]);

  if (profile.isLoading || orders.isLoading) return <DashboardSkeleton />;
  return (
    <div className="space-y-4">
      <PageHeader title={common("earnings")} subtitle={common("earningsNote")} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label={t("totalSales")} value={formatRupees(profile.data?.totalSales ?? 0)} />
        <Stat label={t("thisMonth")} value={formatRupees(summary.thisMonth)} />
        <Stat label={t("pendingMoney")} value={formatRupees(summary.pending)} />
      </div>
      {summary.partial ? <p className="text-sm text-muted">{common("partialChart", { count: summary.count, total: summary.total })}</p> : null}
      <Chart title={t("daily")} data={summary.days} />
      <Chart title={t("topVeg")} data={summary.crops} />
    </div>
  );
}

function Chart({ title, data }: { title: string; data: Array<{ name: string; sales: number }> }) {
  return (
    <section className="card p-4">
      <h2 className="mb-3 font-bold">{title}</h2>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="sales" fill="#2F7D32" radius={6} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
