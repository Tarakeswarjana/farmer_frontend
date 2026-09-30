"use client";

import { useState } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { ListSkeleton } from "@/components/ui/skeleton";
import { LocationPicker } from "@/components/forms/location-picker";
import { MapView } from "@/components/maps/map-view";
import { deliveriesApi } from "@/lib/api/deliveries";
import { fposApi } from "@/lib/api/fpos";
import { listingsApi } from "@/lib/api/listings";
import { marketsApi } from "@/lib/api/markets";
import { marketPricesApi } from "@/lib/api/marketPrices";
import { buyersApi } from "@/lib/api/buyers";
import { farmersApi } from "@/lib/api/farmers";
import { usersApi } from "@/lib/api/users";
import { isApiError } from "@/lib/api/errors";
import { analytics } from "@/lib/monitoring/analytics";
import { pointToMarker } from "@/lib/maps/cluster";
import { queryKeys } from "@/lib/query/client";
import { formatRupees } from "@/lib/utils/format";
import { useCatalog } from "@/hooks/use-catalog";
import { useAuthStore } from "@/stores/auth-store";
import type { DeliveryStatus } from "@/types/api";

const useAcceptedJobs = create<{ ids: string[]; add: (id: string) => void }>()(
  persist(
    (set, get) => ({ ids: [], add: (id) => set({ ids: [id, ...get().ids.filter((item) => item !== id)].slice(0, 20) }) }),
    {
      name: "vm-accepted-jobs",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return { getItem: () => null, setItem: () => undefined, removeItem: () => undefined };
        }
        return window.sessionStorage;
      }),
    },
  ),
);

function toastError(error: unknown) {
  toast.error(isApiError(error) ? error.message : "Something went wrong");
}

export function FpoDashboard() {
  const user = useAuthStore((state) => state.user);
  const fpos = useQuery({ queryKey: queryKeys.fpos({}), queryFn: ({ signal }) => fposApi.list({ limit: 50 }, signal) });
  const mine = fpos.data?.items.find((item) => item.adminUserId === user?._id) ?? fpos.data?.items[0];
  const listings = useQuery({
    queryKey: queryKeys.listings({ fpoId: mine?._id }),
    enabled: Boolean(mine?._id),
    queryFn: ({ signal }) => listingsApi.getListings({ fpoId: mine?._id, limit: 20 }, signal),
  });
  const members = useQuery({
    queryKey: ["fpo-members", mine?._id],
    enabled: Boolean(mine?._id),
    queryFn: ({ signal }) => fposApi.members(mine?._id ?? "", { limit: 100 }, signal),
  });
  const sales = (members.data?.items ?? []).reduce((sum, member) => sum + (member.totalSales ?? 0), 0);
  const complete = (members.data?.meta.total ?? 0) <= (members.data?.items.length ?? 0);
  return (
    <div className="space-y-4">
      <PageHeader title={mine?.name ?? "FPO"} subtitle="Member sales use each farmer profile total from the server." />
      <div className="grid grid-cols-2 gap-3">
        <article className="card p-4"><p className="text-3xl font-bold">{mine?.memberCount ?? 0}</p><p>Members</p></article>
        <article className="card p-4"><p className="text-3xl font-bold">{listings.data?.meta.total ?? 0}</p><p>Listings</p></article>
        <article className="card p-4"><p className="text-2xl font-bold">{complete ? formatRupees(sales) : "—"}</p><p>Member sales</p></article>
        <article className="card p-4"><StatusBadge status={mine?.verificationStatus} /></article>
      </div>
    </div>
  );
}

export function FpoMembers() {
  const user = useAuthStore((state) => state.user);
  const client = useQueryClient();
  const [farmerId, setFarmerId] = useState("");
  const fpos = useQuery({ queryKey: queryKeys.fpos({ members: true }), queryFn: ({ signal }) => fposApi.list({ limit: 20 }, signal) });
  const mine = fpos.data?.items.find((item) => item.adminUserId === user?._id) ?? fpos.data?.items[0];
  const members = useQuery({ queryKey: ["fpo-members", mine?._id], enabled: Boolean(mine), queryFn: ({ signal }) => fposApi.members(mine?._id ?? "", { limit: 50 }, signal) });
  const add = useMutation({
    mutationFn: () => fposApi.addMember(mine?._id ?? "", farmerId),
    onSuccess: () => { setFarmerId(""); void client.invalidateQueries({ queryKey: ["fpo-members"] }); },
    onError: toastError,
  });
  const remove = useMutation({
    mutationFn: (id: string) => fposApi.removeMember(mine?._id ?? "", id),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["fpo-members"] }),
    onError: toastError,
  });
  return (
    <div className="space-y-3">
      <PageHeader title="Members" />
      <form className="flex gap-2" onSubmit={(event) => { event.preventDefault(); add.mutate(); }}>
        <input className="min-h-14 flex-1 rounded-2xl border border-line px-3" placeholder="Farmer profile id" value={farmerId} onChange={(event) => setFarmerId(event.target.value)} />
        <Button disabled={add.isPending}>Add</Button>
      </form>
      {members.isLoading ? <ListSkeleton /> : null}
      {!members.data?.items.length ? <EmptyState title="No members yet." /> : null}
      {members.data?.items.map((member) => (
        <article key={member._id} className="card flex items-center justify-between p-4">
          <div><p className="font-bold">{member.farmerName}</p><p>{member.district} · {formatRupees(member.totalSales)}</p></div>
          <Button variant="danger" onClick={() => remove.mutate(member._id)}>Remove</Button>
        </article>
      ))}
    </div>
  );
}

export function FpoListings() {
  const catalog = useCatalog();
  const user = useAuthStore((state) => state.user);
  const fpos = useQuery({ queryKey: queryKeys.fpos({ listings: true }), queryFn: ({ signal }) => fposApi.list({ limit: 20 }, signal) });
  const mine = fpos.data?.items.find((item) => item.adminUserId === user?._id) ?? fpos.data?.items[0];
  const listings = useQuery({ queryKey: queryKeys.listings({ fpo: mine?._id }), enabled: Boolean(mine), queryFn: ({ signal }) => listingsApi.getListings({ fpoId: mine?._id, limit: 30 }, signal) });
  return (
    <div className="space-y-3">
      <PageHeader title="Supply" />
      {listings.data?.items.map((listing) => <article key={listing._id} className="card p-4"><p className="font-bold">{catalog.label(listing.cropId)}</p><p>{listing.availableQuantity} {listing.unit} · {formatRupees(listing.expectedPrice)}</p><StatusBadge status={listing.status} /></article>)}
    </div>
  );
}

export function FpoSales() {
  return <FpoDashboard />;
}

export function ProfileEditor() {
  const user = useAuthStore((state) => state.user);
  const [name, setName] = useState(user?.name ?? "");
  const [point, setPoint] = useState({ latitude: user?.location?.coordinates?.[1] ?? 22.72, longitude: user?.location?.coordinates?.[0] ?? 88.48 });
  const farmer = useQuery({ queryKey: queryKeys.farmerProfile, queryFn: ({ signal }) => farmersApi.myProfile(signal), enabled: user?.role === "FARMER" || user?.role === "FPO_ADMIN", retry: false });
  const buyer = useQuery({ queryKey: queryKeys.buyerProfile, queryFn: ({ signal }) => buyersApi.myProfile(signal), enabled: ["BUYER", "TRADER", "RETAILER", "RESTAURANT"].includes(user?.role ?? ""), retry: false });
  const save = useMutation({
    mutationFn: () => usersApi.updateMe({ name }),
    onSuccess: () => toast.success("Saved"),
    onError: toastError,
  });
  const saveLocation = useMutation({
    mutationFn: () => usersApi.updateLocation(point),
    onSuccess: () => toast.success("Location saved"),
    onError: toastError,
  });
  return (
    <div className="space-y-4">
      <PageHeader title="Profile" />
      <label className="block font-semibold">Name<input className="mt-1 min-h-14 w-full rounded-2xl border border-line px-3" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
      <p>{user?.phone} · {user?.role}</p>
      {farmer.data ? <p>Verification: {farmer.data.verificationStatus} · Rating {farmer.data.rating}</p> : null}
      {buyer.data ? <p>{buyer.data.businessName} · {buyer.data.verificationStatus} · Rating {buyer.data.rating}</p> : null}
      <LocationPicker latitude={point.latitude} longitude={point.longitude} onChange={setPoint} />
      <Button variant="secondary" onClick={() => saveLocation.mutate()}>Save location</Button>
    </div>
  );
}

export function TransporterJobs() {
  const profile = useQuery({ queryKey: queryKeys.transporterProfile, queryFn: ({ signal }) => deliveriesApi.myProfile(signal) });
  const jobs = useQuery({ queryKey: queryKeys.deliveries({ available: true }), queryFn: ({ signal }) => deliveriesApi.available({ limit: 20 }, signal) });
  const add = useAcceptedJobs((state) => state.add);
  const accept = useMutation({
    mutationFn: (id: string) => {
      const vehicleId = profile.data?.vehicles[0]?._id;
      if (!profile.data || !vehicleId) throw new Error("Add a verified vehicle on your profile first.");
      return deliveriesApi.assign(id, { transporterId: profile.data._id, vehicleId });
    },
    onSuccess: (delivery) => { add(delivery._id); toast.success("Job accepted"); },
    onError: toastError,
  });
  return (
    <div className="space-y-3">
      <PageHeader title="Available deliveries" subtitle={`${jobs.data?.meta.total ?? 0} nearby jobs`} />
      {jobs.isLoading ? <ListSkeleton /> : null}
      {!jobs.data?.items.length && !jobs.isLoading ? <EmptyState title="No deliveries are waiting nearby." /> : null}
      {jobs.data?.items.map((job) => (
        <article key={job._id} className="card space-y-2 p-4">
          <p className="text-xl font-bold">{formatRupees(job.estimatedCost)}</p>
          <p>Pickup {job.pickupLocation?.address}</p>
          <p>Drop {job.dropLocation?.address}</p>
          <p>{job.distance ? `${(job.distance / 1000).toFixed(1)} km` : ""}</p>
          <Button size="lg" disabled={accept.isPending || !profile.data?.isVerified} onClick={() => accept.mutate(job._id)}>Accept</Button>
          {!profile.data?.isVerified ? <p className="text-sm text-muted">A verified transporter profile is required.</p> : null}
        </article>
      ))}
    </div>
  );
}

export function TransporterDeliveries() {
  const ids = useAcceptedJobs((state) => state.ids);
  const queries = useQueries({ queries: ids.map((id) => ({ queryKey: queryKeys.delivery(id), queryFn: () => deliveriesApi.get(id) })) });
  return (
    <div className="space-y-3">
      <PageHeader title="My deliveries" subtitle="The API lists open jobs, not a transporter history. This page reloads jobs accepted in this browser session." />
      {!ids.length ? <EmptyState title="No accepted jobs in this session." /> : null}
      {queries.map((query) => query.data ? <a key={query.data._id} href={`/transporter/deliveries/${query.data._id}`} className="card block p-4"><StatusBadge status={query.data.status} /><p>{formatRupees(query.data.estimatedCost)}</p></a> : null)}
    </div>
  );
}

export function DeliveryDetail({ id }: { id: string }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.delivery(id), queryFn: ({ signal }) => deliveriesApi.get(id, signal) });
  const update = useMutation({
    mutationFn: (status: DeliveryStatus) => deliveriesApi.updateStatus(id, { status }),
    onSuccess: (delivery) => {
      if (delivery.status === "DELIVERED") analytics.track("DELIVERY_COMPLETED");
      void client.invalidateQueries({ queryKey: queryKeys.delivery(id) });
    },
    onError: toastError,
  });
  const steps: DeliveryStatus[] = ["REQUESTED", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED"];
  if (!query.data) return <ListSkeleton />;
  const delivery = query.data;
  const marker = pointToMarker(delivery._id, "Drop", "transporter", delivery.dropLocation?.location);
  return (
    <div className="space-y-4">
      <PageHeader title="Delivery" />
      <StatusBadge status={delivery.status} />
      <ol className="space-y-2">
        {steps.map((step) => <li key={step}>{steps.indexOf(delivery.status as DeliveryStatus) >= steps.indexOf(step) ? "✓" : "○"} {step}</li>)}
      </ol>
      <div className="grid grid-cols-2 gap-2">
        {steps.filter((step) => step !== "REQUESTED").map((step) => <Button key={step} variant="secondary" onClick={() => update.mutate(step)}>{step.replaceAll("_", " ")}</Button>)}
      </div>
      {marker ? <MapView markers={[marker]} title="Drop" /> : null}
    </div>
  );
}

export function TransporterProfile() {
  return <ProfileEditor />;
}

export function MarketDashboard() {
  const markets = useQuery({ queryKey: queryKeys.markets({ mine: true }), queryFn: ({ signal }) => marketsApi.list({ limit: 20 }, signal) });
  return (
    <div className="space-y-3">
      <PageHeader title="Markets" />
      {markets.data?.items.map((market) => <article key={market._id} className="card p-4"><p className="font-bold">{market.name}</p><p>{market.district} · {market.marketType}</p></article>)}
    </div>
  );
}

export function MarketPriceEntry() {
  return <AdminPricesProxy />;
}

function AdminPricesProxy() {
  const catalog = useCatalog();
  const [cropId, setCropId] = useState("");
  const [marketId, setMarketId] = useState("");
  const [modalPrice, setModal] = useState(28);
  const create = useMutation({
    mutationFn: () => marketPricesApi.create({ cropId, marketId, minimumPrice: modalPrice - 2, maximumPrice: modalPrice + 2, modalPrice, date: new Date().toISOString().slice(0, 10), source: "MANUAL" }),
    onSuccess: () => toast.success("Saved"),
    onError: toastError,
  });
  return (
    <form className="card space-y-3 p-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
      <PageHeader title="Record a price" />
      <select className="min-h-14 w-full rounded-2xl border px-3" value={cropId} onChange={(event) => setCropId(event.target.value)}>{catalog.crops.data?.items.map((crop) => <option key={crop._id} value={crop._id}>{crop.name}</option>)}</select>
      <select className="min-h-14 w-full rounded-2xl border px-3" value={marketId} onChange={(event) => setMarketId(event.target.value)}>{catalog.markets.data?.items.map((market) => <option key={market._id} value={market._id}>{market.name}</option>)}</select>
      <input className="min-h-14 w-full rounded-2xl border px-3 text-2xl font-bold" value={modalPrice} onChange={(event) => setModal(Number(event.target.value))} />
      <Button disabled={create.isPending}>Save</Button>
    </form>
  );
}
