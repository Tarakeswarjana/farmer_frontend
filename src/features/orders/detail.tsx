"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { RatingStars } from "@/components/ui/rating-stars";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { ImageUploader } from "@/components/forms/image-uploader";
import { ErrorState } from "@/components/ui/error-state";
import { disputesApi } from "@/lib/api/disputes";
import { ordersApi } from "@/lib/api/orders";
import { paymentsApi } from "@/lib/api/payments";
import { reviewsApi } from "@/lib/api/reviews";
import { isApiError } from "@/lib/api/errors";
import { analytics } from "@/lib/monitoring/analytics";
import { queryKeys } from "@/lib/query/client";
import { assertOnline, formatRupees, sanitizeText } from "@/lib/utils/format";
import { useCatalog } from "@/hooks/use-catalog";
import { useAuthStore } from "@/stores/auth-store";
import type { Order, OrderStatus, PaymentMethod } from "@/types/api";

const flow: OrderStatus[] = ["PENDING", "CONFIRMED", "READY_FOR_PICKUP", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"];

export function OrderDetail({ id }: { id: string; hrefBase?: string }) {
  const common = useTranslations("common");
  const catalog = useCatalog();
  const user = useAuthStore((state) => state.user);
  const params = useSearchParams();
  const client = useQueryClient();
  const query = useQuery({ queryKey: queryKeys.order(id), queryFn: ({ signal }) => ordersApi.get(id, signal) });
  const [method, setMethod] = useState<PaymentMethod>((params.get("method") as PaymentMethod) || "CASH");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("Quality issue");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [payNote, setPayNote] = useState("");

  const refresh = () => client.invalidateQueries({ queryKey: queryKeys.order(id) });
  const act = useMutation({
    mutationFn: async (action: "confirm" | "complete" | "cancel" | OrderStatus) => {
      assertOnline();
      if (action === "confirm") return ordersApi.confirm(id);
      if (action === "complete") return ordersApi.complete(id);
      if (action === "cancel") return ordersApi.cancel(id);
      return ordersApi.updateStatus(id, action);
    },
    onSuccess: async () => { await refresh(); toast.success(common("success")); },
    onError: (error) => toast.error(isApiError(error) ? error.message : common("connectionRequired")),
  });
  const pay = useMutation({
    mutationFn: async () => {
      assertOnline();
      analytics.track("PAYMENT_STARTED");
      const created = await paymentsApi.create({ orderId: id, method });
      if (created.providerPayload.mock) {
        setPayNote(common("mockPay"));
        return created.payment;
      }
      const verified = await paymentsApi.verify({ paymentId: created.payment._id });
      analytics.track("PAYMENT_COMPLETED");
      return verified;
    },
    onSuccess: async (payment) => {
      await refresh();
      if (payment.status === "SUCCESS") toast.success(common("paymentVerified"));
    },
    onError: (error) => toast.error(isApiError(error) ? error.message : common("connectionRequired")),
  });
  const review = useMutation({
    mutationFn: () => reviewsApi.create({ orderId: id, rating, comment }),
    onSuccess: () => toast.success(common("success")),
    onError: (error) => toast.error(isApiError(error) ? error.message : ""),
  });
  const dispute = useMutation({
    mutationFn: () => disputesApi.create({ orderId: id, reason, description, images }),
    onSuccess: () => toast.success(common("success")),
    onError: (error) => toast.error(isApiError(error) ? error.message : ""),
  });

  if (query.isLoading) return <DashboardSkeleton />;
  if (query.isError || !query.data) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;
  const order = query.data;
  const mine = user?.role === "FARMER" || user?.roles.includes("FARMER");
  return (
    <div className="space-y-4">
      <PageHeader title={order.orderNumber ?? common("orders")} subtitle={catalog.label(order.cropId)} />
      <article className="card space-y-2 p-4 text-lg">
        <p>{order.quantity} {order.unit} · {formatRupees(order.unitPrice)}</p>
        <p>{common("transport")} {formatRupees(order.transportCharge)}</p>
        <p>{common("commission")} {formatRupees(order.commission)}</p>
        <p>{common("tax")} {formatRupees(order.tax)}</p>
        <p className="text-3xl font-bold">{common("total")} {formatRupees(order.totalAmount)}</p>
        <p>{common("pickup")}: {sanitizeText(order.pickupLocation?.address)}</p>
        <p>{common("date")}: {order.scheduledPickupDate ?? "—"}</p>
        <StatusBadge status={order.orderStatus} />
        <StatusBadge status={order.paymentStatus} />
      </article>
      <Timeline order={order} />
      <div className="flex flex-wrap gap-2">
        {mine && order.orderStatus === "PENDING" ? <Button onClick={() => act.mutate("confirm")}>{common("confirm")}</Button> : null}
        {order.orderStatus === "DELIVERED" ? <Button onClick={() => act.mutate("complete")}>{common("complete")}</Button> : null}
        {!["PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED"].includes(order.orderStatus) ? <Button variant="danger" onClick={() => act.mutate("cancel")}>{common("cancel")}</Button> : null}
      </div>
      {user?._id === order.buyerId ? (
        <section className="card space-y-3 p-4">
          <h2 className="text-xl font-bold">{common("pay")}</h2>
          <div className="grid grid-cols-2 gap-2">
            {(["CASH", "UPI", "BANK_TRANSFER", "RAZORPAY"] as PaymentMethod[]).map((item) => (
              <button key={item} type="button" className={`min-h-12 rounded-2xl border font-semibold ${method === item ? "bg-brand text-white" : ""}`} onClick={() => setMethod(item)}>{item}</button>
            ))}
          </div>
          {payNote ? <p role="status">{payNote}</p> : null}
          <Button disabled={pay.isPending || order.paymentStatus === "PAID"} onClick={() => pay.mutate()}>{pay.isPending ? common("saving") : common("pay")}</Button>
        </section>
      ) : null}
      {order.orderStatus === "COMPLETED" ? (
        <form className="card space-y-3 p-4" onSubmit={(event) => { event.preventDefault(); review.mutate(); }}>
          <h2 className="text-xl font-bold">{common("reviews")}</h2>
          <RatingStars label={common("rating")} value={rating} onChange={setRating} />
          <textarea className="min-h-24 w-full rounded-2xl border border-line p-3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder={common("comment")} />
          <Button disabled={review.isPending}>{common("submit")}</Button>
        </form>
      ) : null}
      <form className="card space-y-3 p-4" onSubmit={(event) => { event.preventDefault(); dispute.mutate(); }}>
        <h2 className="text-xl font-bold">{common("dispute")}</h2>
        <select className="min-h-12 w-full rounded-2xl border border-line px-3" value={reason} onChange={(event) => setReason(event.target.value)}>
          {["Quantity mismatch", "Quality issue", "Payment issue", "Late delivery", "Wrong vegetable", "Other"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <textarea className="min-h-24 w-full rounded-2xl border border-line p-3" value={description} onChange={(event) => setDescription(event.target.value)} />
        <ImageUploader label={common("photos")} urls={images} onChange={setImages} />
        <Button variant="secondary" disabled={dispute.isPending}>{common("submit")}</Button>
      </form>
    </div>
  );
}

function Timeline({ order }: { order: Order }) {
  const labels = ["Order confirmed", "Payment", "Pickup", "Transport", "Delivered"];
  const index = Math.max(0, flow.indexOf(order.orderStatus as OrderStatus));
  const flags = [
    index >= 1,
    order.paymentStatus === "PAID",
    index >= 3,
    index >= 4,
    index >= 5,
  ];
  return (
    <ol className="card space-y-2 p-4">
      {labels.map((label, item) => (
        <li key={label} className="flex items-center gap-2 text-lg">
          <span aria-hidden>{flags[item] ? "✓" : "○"}</span>
          {label}
        </li>
      ))}
    </ol>
  );
}
