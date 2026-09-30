import { VegetableDetail } from "@/features/public/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VegetableDetail id={id} />;
}
