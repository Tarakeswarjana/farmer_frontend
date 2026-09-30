"use client";

import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { DataTable, type DataColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardSkeleton, ListSkeleton } from "@/components/ui/skeleton";
import { adminApi, type AdminQuery } from "@/lib/api/admin";
import { cropsApi } from "@/lib/api/crops";
import { disputesApi } from "@/lib/api/disputes";
import { healthApi } from "@/lib/api/health";
import { marketPricesApi } from "@/lib/api/marketPrices";
import { isApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/query/client";
import { formatRupees } from "@/lib/utils/format";
import { useCatalog } from "@/hooks/use-catalog";
import { useUiStore, type ThemeMode } from "@/stores/ui-store";
import type { Page, VerificationStatus } from "@/types/api";

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="card p-4"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted">{label}</p></div>;
}

export function AdminDashboard() {
  const query = useQuery({ queryKey: queryKeys.admin("dashboard"), queryFn: ({ signal }) => adminApi.dashboard(signal) });
  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError || !query.data) return <p role="alert">{isApiError(query.error) ? query.error.message : "Error"}</p>;
  const data = query.data;
  const cards = [
    ["Farmers", data.totalFarmers],
    ["Buyers", data.totalBuyers],
    ["Active listings", data.activeListings],
    ["Today's orders", data.todaysOrders],
    ["GMV", formatRupees(data.totalGmv)],
    ["Pending payments", data.pendingPayments],
    ["Active deliveries", data.activeDeliveries],
    ["Completed orders", data.completedOrders],
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(([label, value]) => <Stat key={String(label)} label={String(label)} value={String(value)} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Chart title="Top crops" data={data.topVegetables.map((row) => ({ name: row.name ?? row.cropId.slice(-4), gmv: row.gmv }))} />
        <Chart title="Top markets" data={data.topMarkets.map((row) => ({ name: row.name ?? row.marketId.slice(-4), gmv: row.gmv }))} />
      </div>
    </div>
  );
}

function Chart({ title, data }: { title: string; data: Array<{ name: string; gmv: number }> }) {
  return (
    <section className="card h-72 p-4">
      <h2 className="mb-2 font-bold">{title}</h2>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="gmv" fill="#2F7D32" /></BarChart>
      </ResponsiveContainer>
    </section>
  );
}

export function AdminResource<T extends { _id: string }>({
  title,
  resource,
  fetcher,
  columns,
  mobile,
  note,
}: {
  title: string;
  resource: string;
  fetcher: (params: AdminQuery, signal?: AbortSignal) => Promise<Page<T>>;
  columns: DataColumn<T>[];
  mobile: (row: T) => ReactNode;
  note?: string;
}) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [selected, setSelected] = useState<string[]>([]);
  const query = useQuery({
    queryKey: queryKeys.admin(resource, { page, q, status, sortBy }),
    queryFn: ({ signal }) => fetcher({ page, limit: 20, q, status: status || undefined, sortBy, sortOrder: "desc" }, signal),
  });
  if (query.isLoading) return <ListSkeleton />;
  if (query.isError) return <p role="alert">{isApiError(query.error) ? query.error.message : "Error"}</p>;
  const rows = query.data?.items ?? [];
  return (
    <div className="space-y-3">
      <PageHeader title={title} subtitle={note} />
      <div className="flex flex-wrap gap-2">
        <select aria-label="Status" className="min-h-touch rounded-2xl border border-line px-3" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">All statuses</option>
          <option value="PENDING">PENDING</option>
          <option value="VERIFIED">VERIFIED</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="OPEN">OPEN</option>
        </select>
        <select aria-label="Sort" className="min-h-touch rounded-2xl border border-line px-3" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="name">Name</option>
        </select>
        {selected.length ? <p className="self-center text-sm font-semibold">{selected.length} selected</p> : null}
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        meta={query.data?.meta}
        onPage={setPage}
        search={q}
        onSearch={(value) => { setQ(value); setPage(1); }}
        selected={selected}
        onToggle={(id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])}
        onToggleAll={() => setSelected(selected.length === rows.length ? [] : rows.map((row) => row._id))}
        mobile={mobile}
      />
    </div>
  );
}

export function AdminUsers() {
  const client = useQueryClient();
  const block = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) => adminApi.blockUser(id, isBlocked),
    onSuccess: () => { toast.success("Updated"); void client.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Error"),
  });
  return (
    <AdminResource
      title="Users"
      resource="users"
      fetcher={adminApi.users}
      columns={[
        { key: "name", header: "Name", render: (row) => row.name, exportValue: (row) => row.name },
        { key: "role", header: "Role", render: (row) => row.role, exportValue: (row) => row.role },
        { key: "phone", header: "Phone", render: (row) => row.phone, exportValue: (row) => row.phone },
        { key: "location", header: "Location", render: (row) => row.district, exportValue: (row) => row.district },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.isBlocked ? "CANCELLED" : "ACTIVE"} />, exportValue: (row) => (row.isBlocked ? "blocked" : "active") },
        { key: "joined", header: "Joined", render: (row) => row.createdAt?.slice(0, 10), exportValue: (row) => row.createdAt ?? "" },
        { key: "actions", header: "Actions", render: (row) => (
          <Button variant="secondary" onClick={() => block.mutate({ id: row._id, isBlocked: !row.isBlocked })}>{row.isBlocked ? "Unblock" : "Block"}</Button>
        ) },
      ]}
      mobile={(row) => <article className="card p-4"><p className="font-bold">{row.name}</p><p>{row.role} · {row.phone}</p></article>}
    />
  );
}

function verifyButtons(id: string, kind: "farmer" | "buyer" | "fpo") {
  return <VerifyButtons id={id} kind={kind} />;
}

function VerifyButtons({ id, kind }: { id: string; kind: "farmer" | "buyer" | "fpo" }) {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (status: VerificationStatus) => {
      if (kind === "farmer") await adminApi.verifyFarmer(id, status);
      else if (kind === "buyer") await adminApi.verifyBuyer(id, status);
      else await adminApi.verifyFpo(id, status);
    },
    onSuccess: () => { toast.success("Updated"); void client.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (error) => toast.error(isApiError(error) ? error.message : "Error"),
  });
  return (
    <div className="flex flex-wrap gap-1">
      <Button onClick={() => mutation.mutate("VERIFIED")}>Approve</Button>
      <Button variant="danger" onClick={() => mutation.mutate("REJECTED")}>Reject</Button>
      <Button variant="secondary" onClick={() => mutation.mutate("PENDING")}>More info</Button>
    </div>
  );
}

export function AdminFarmers() {
  return (
    <AdminResource
      title="Farmers"
      resource="farmers"
      fetcher={adminApi.farmers}
      columns={[
        { key: "name", header: "Name", render: (row) => row.farmerName, exportValue: (row) => row.farmerName },
        { key: "district", header: "District", render: (row) => row.district, exportValue: (row) => row.district },
        { key: "status", header: "Status", render: (row) => <StatusBadge status={row.verificationStatus} />, exportValue: (row) => row.verificationStatus },
        { key: "sales", header: "Sales", render: (row) => formatRupees(row.totalSales), exportValue: (row) => row.totalSales },
        { key: "actions", header: "Actions", render: (row) => verifyButtons(row._id, "farmer") },
      ]}
      mobile={(row) => (
        <article className="card space-y-2 p-4">
          <p className="font-bold">{row.farmerName}</p>
          <p>{row.district} · {row.address}</p>
          <p>Farm {row.farmSize ?? "—"} {row.farmSizeUnit ?? ""}</p>
          <StatusBadge status={row.verificationStatus} />
          {verifyButtons(row._id, "farmer")}
        </article>
      )}
    />
  );
}

export function AdminBuyers() {
  return (
    <AdminResource title="Buyers" resource="buyers" fetcher={adminApi.buyers} columns={[
      { key: "name", header: "Business", render: (row) => row.businessName, exportValue: (row) => row.businessName },
      { key: "type", header: "Type", render: (row) => row.businessType, exportValue: (row) => String(row.businessType) },
      { key: "district", header: "District", render: (row) => row.district, exportValue: (row) => row.district },
      { key: "status", header: "Status", render: (row) => <StatusBadge status={row.verificationStatus} />, exportValue: (row) => row.verificationStatus },
      { key: "actions", header: "Actions", render: (row) => verifyButtons(row._id, "buyer") },
    ]} mobile={(row) => <article className="card p-4"><p className="font-bold">{row.businessName}</p>{verifyButtons(row._id, "buyer")}</article>} />
  );
}

export function AdminFpos() {
  return (
    <AdminResource title="FPOs" resource="fpos" fetcher={adminApi.fpos} columns={[
      { key: "name", header: "Name", render: (row) => row.name, exportValue: (row) => row.name },
      { key: "members", header: "Members", render: (row) => row.memberCount, exportValue: (row) => row.memberCount },
      { key: "district", header: "District", render: (row) => row.district, exportValue: (row) => row.district },
      { key: "actions", header: "Actions", render: (row) => verifyButtons(row._id, "fpo") },
    ]} mobile={(row) => <article className="card p-4"><p className="font-bold">{row.name}</p><p>{row.memberCount} members</p></article>} />
  );
}

export function AdminListings() {
  const catalog = useCatalog();
  return (
    <AdminResource title="Listings" resource="listings" fetcher={adminApi.listings} columns={[
      { key: "crop", header: "Crop", render: (row) => catalog.label(row.cropId), exportValue: (row) => catalog.label(row.cropId) },
      { key: "qty", header: "Quantity", render: (row) => `${row.availableQuantity} ${row.unit}`, exportValue: (row) => row.availableQuantity },
      { key: "price", header: "Price", render: (row) => formatRupees(row.expectedPrice), exportValue: (row) => row.expectedPrice },
      { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} />, exportValue: (row) => row.status },
    ]} mobile={(row) => <article className="card p-4"><p className="font-bold">{catalog.label(row.cropId)}</p><StatusBadge status={row.status} /></article>} />
  );
}

export function AdminOrders() {
  return (
    <AdminResource title="Orders" resource="orders" fetcher={adminApi.orders} columns={[
      { key: "number", header: "Order", render: (row) => row.orderNumber, exportValue: (row) => row.orderNumber },
      { key: "total", header: "Total", render: (row) => formatRupees(row.totalAmount), exportValue: (row) => row.totalAmount },
      { key: "status", header: "Status", render: (row) => <StatusBadge status={row.orderStatus} />, exportValue: (row) => row.orderStatus },
      { key: "pay", header: "Payment", render: (row) => <StatusBadge status={row.paymentStatus} />, exportValue: (row) => row.paymentStatus },
    ]} mobile={(row) => <article className="card p-4"><p className="font-mono">{row.orderNumber}</p><p>{formatRupees(row.totalAmount)}</p></article>} />
  );
}

export function AdminPayments() {
  return (
    <AdminResource title="Payments" resource="payments" fetcher={adminApi.payments} columns={[
      { key: "amount", header: "Amount", render: (row) => formatRupees(row.amount), exportValue: (row) => row.amount },
      { key: "method", header: "Method", render: (row) => row.method, exportValue: (row) => String(row.method) },
      { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} />, exportValue: (row) => row.status },
    ]} mobile={(row) => <article className="card p-4"><p>{formatRupees(row.amount)}</p><StatusBadge status={row.status} /></article>} />
  );
}

export function AdminMarkets() {
  return (
    <AdminResource title="Markets" resource="markets" fetcher={adminApi.markets} columns={[
      { key: "name", header: "Name", render: (row) => row.name, exportValue: (row) => row.name },
      { key: "type", header: "Type", render: (row) => row.marketType, exportValue: (row) => String(row.marketType) },
      { key: "district", header: "District", render: (row) => row.district, exportValue: (row) => row.district },
    ]} mobile={(row) => <article className="card p-4"><p className="font-bold">{row.name}</p><p>{row.district}</p></article>} />
  );
}

export function AdminDisputes() {
  const client = useQueryClient();
  const resolve = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "UNDER_REVIEW" | "RESOLVED" | "REJECTED" }) => disputesApi.resolve(id, { status }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ["admin", "disputes"] }),
  });
  return (
    <AdminResource title="Disputes" resource="disputes" fetcher={adminApi.disputes} columns={[
      { key: "reason", header: "Reason", render: (row) => row.reason, exportValue: (row) => row.reason },
      { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} />, exportValue: (row) => row.status },
      { key: "actions", header: "Actions", render: (row) => <Button onClick={() => resolve.mutate({ id: row._id, status: "RESOLVED" })}>Resolve</Button> },
    ]} mobile={(row) => <article className="card p-4"><p>{row.reason}</p><p>{row.description}</p></article>} />
  );
}

export function AdminOffersNote() {
  return <AdminListings />;
}

export function AdminCrops() {
  const [name, setName] = useState("");
  const [bengaliName, setBengaliName] = useState("");
  const client = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.crops({ admin: true }), queryFn: ({ signal }) => cropsApi.list({ limit: 100 }, signal) });
  const create = useMutation({
    mutationFn: () => cropsApi.create({ name, bengaliName, category: "VEGETABLE", season: "YEAR_ROUND", unit: "KG" }),
    onSuccess: () => { setName(""); void client.invalidateQueries({ queryKey: ["crops"] }); },
  });
  return (
    <div className="space-y-4">
      <PageHeader title="Crops" />
      <form className="card flex flex-wrap gap-2 p-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
        <input className="min-h-touch rounded-2xl border border-line px-3" placeholder="English name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="min-h-touch rounded-2xl border border-line px-3" placeholder="Bengali name" value={bengaliName} onChange={(event) => setBengaliName(event.target.value)} />
        <Button disabled={create.isPending}>Save</Button>
      </form>
      {query.data?.items.map((crop) => <article key={crop._id} className="card p-3">{crop.bengaliName} · {crop.name}</article>)}
    </div>
  );
}

export function AdminPrices() {
  const catalog = useCatalog();
  const [cropId, setCropId] = useState("");
  const [marketId, setMarketId] = useState("");
  const [minimumPrice, setMin] = useState(20);
  const [maximumPrice, setMax] = useState(30);
  const [modalPrice, setModal] = useState(25);
  const create = useMutation({
    mutationFn: () => marketPricesApi.create({ cropId, marketId, date: new Date().toISOString().slice(0, 10), minimumPrice, maximumPrice, modalPrice, source: "MANUAL" }),
    onSuccess: () => toast.success("Price saved"),
    onError: (error) => toast.error(isApiError(error) ? error.message : "Error"),
  });
  return (
    <form className="card space-y-3 p-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
      <PageHeader title="Market prices" />
      <select className="min-h-touch w-full rounded-2xl border border-line px-3" value={cropId} onChange={(event) => setCropId(event.target.value)}>{catalog.crops.data?.items.map((crop) => <option key={crop._id} value={crop._id}>{crop.name}</option>)}</select>
      <select className="min-h-touch w-full rounded-2xl border border-line px-3" value={marketId} onChange={(event) => setMarketId(event.target.value)}>{catalog.markets.data?.items.map((market) => <option key={market._id} value={market._id}>{market.name}</option>)}</select>
      <input className="min-h-touch w-full rounded-2xl border border-line px-3" value={minimumPrice} onChange={(event) => setMin(Number(event.target.value))} aria-label="Minimum" />
      <input className="min-h-touch w-full rounded-2xl border border-line px-3" value={maximumPrice} onChange={(event) => setMax(Number(event.target.value))} aria-label="Maximum" />
      <input className="min-h-touch w-full rounded-2xl border border-line px-3" value={modalPrice} onChange={(event) => setModal(Number(event.target.value))} aria-label="Modal" />
      <Button disabled={create.isPending}>Save price</Button>
    </form>
  );
}

export function AdminDeliveries() {
  return <p className="card p-4">Deliveries are assigned from the transporter app. Admins can open a delivery by id from an order once a delivery exists. There is no admin delivery list in the API.</p>;
}

export function AdminReports() {
  const logs = useQuery({ queryKey: queryKeys.admin("audit"), queryFn: ({ signal }) => adminApi.auditLogs({ limit: 30 }, signal) });
  return (
    <div className="space-y-3">
      <PageHeader title="Reports" subtitle="Audit log from the server. Business totals stay on the dashboard." />
      {logs.data?.items.map((log) => <article key={log._id} className="card p-3 text-sm"><p className="font-bold">{log.action}</p><p>{log.entity} {log.entityId}</p></article>)}
    </div>
  );
}

export function AdminSettings() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const health = useQuery({ queryKey: ["health"], queryFn: () => healthApi.get() });
  return (
    <div className="card space-y-3 p-4">
      <PageHeader title="Settings" subtitle="Language and theme are saved on this device. Platform settings are not a separate API." />
      <label className="block font-semibold">Theme
        <select className="mt-1 min-h-touch w-full rounded-2xl border border-line px-3" value={theme} onChange={(event) => setTheme(event.target.value as ThemeMode)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </label>
      <p>API health: {health.data?.status ?? (health.isError ? "unreachable" : "checking")}</p>
    </div>
  );
}
