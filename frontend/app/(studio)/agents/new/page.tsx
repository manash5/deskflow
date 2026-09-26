import { redirect } from "next/navigation";

export default async function NewAgentPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams({ new: "1" });
  if (params.customerId) {
    query.set("customerId", params.customerId);
  }
  redirect(`/agents?${query.toString()}`);
}
