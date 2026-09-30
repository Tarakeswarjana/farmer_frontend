import { ChatThread } from "@/features/chat/screens";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ChatThread id={id} />;
}
