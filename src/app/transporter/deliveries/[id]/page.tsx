import { DeliveryDetail } from "@/features/roles/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeliveryDetail id={id} />;
}
