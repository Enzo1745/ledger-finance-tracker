import { createClient } from "@/lib/supabase/server";
import { getCategories } from "@/lib/data/categories";
import { getMonthlySummary } from "@/lib/data/summary";
import { getProfile } from "@/lib/data/profile";
import DashboardClient from "./DashboardClient";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();

  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userEmail = headersList.get("x-user-email");
  if (!userId) redirect("/login");

  const profile = await getProfile(supabase, userId);
  if (!profile.ok) return <p>{profile.error}</p>;

  const summary = await getMonthlySummary(supabase, userId);
  if (!summary.ok) return <p>{summary.error}</p>;

  const categories = await getCategories();
  if (!categories.ok) return <p>{categories.error}</p>;

  // Signed URLs expire, so they're generated per request, outside the cache.
  const transactions_with_urls = await Promise.all(
    summary.data.transactions.map(async (t) => {
      if (!t.receipt_path) return { ...t, receiptUrl: null };
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(t.receipt_path, 3600);
      return { ...t, receiptUrl: data?.signedUrl ?? null };
    }),
  );

  return (
    <DashboardClient
      email={userEmail ?? ""}
      display_name={profile.data.display_name ?? undefined}
      transactions_list={transactions_with_urls}
      categories_list={categories.data}
    />
  );
}
