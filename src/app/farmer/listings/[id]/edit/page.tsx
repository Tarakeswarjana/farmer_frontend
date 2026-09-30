import { ListingWizard } from "@/features/farmer/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ListingWizard listingId={id} />;
}
