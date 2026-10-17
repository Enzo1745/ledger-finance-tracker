import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";
import { headers } from "next/headers";
import { getCategories } from "@/lib/data/categories";
import { getMonthlySummary } from "@/lib/data/summary";

export default async function Dashboard() {
  const supabase = await createClient();

  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const userEmail = headersList.get("x-user-email");

  const { data: user_profile, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", userId)
    .single();

  if (error || !user_profile) {
    console.error("Failed to load profile:", error);
    return <p>Could not load your profile.</p>;
  }

  let summary;
  try {
    summary = await getMonthlySummary(supabase, userId!);
  } catch {
    return <p>Could not fetch transactions</p>;
  }

  // Signed URLs expire, so they're generated per request, outside the cache.
  const transactions_with_urls = await Promise.all(
    summary.transactions.map(async (t) => {
      if (!t.receipt_path) return { ...t, receiptUrl: null };
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(t.receipt_path, 3600);
      return { ...t, receiptUrl: data?.signedUrl ?? null };
    }),
  );

  let categories_list;
  try {
    categories_list = await getCategories();
  } catch {
    return <p>Could not fetch categories</p>;
  }

  return (
    <DashboardClient
      email={userEmail!}
      display_name={user_profile.display_name}
      transactions_list={transactions_with_urls}
      balance={summary.total}
      categories_list={categories_list}
    />
  );
}
