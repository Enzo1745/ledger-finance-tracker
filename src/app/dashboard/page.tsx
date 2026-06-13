import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: user_profile, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (error || !user_profile) {
    console.error("Failed to load profile:", error);
    return <p>Could not load your profile.</p>;
  }

  const { data: transactions_list, error: transactions_error } = await supabase
    .from("transactions")
    .select("*");
  if (transactions_error || !transactions_list) {
    return <p>Could not fetch transactions</p>;
  }

  const transactions_with_urls = await Promise.all(
    transactions_list.map(async (t) => {
      if (!t.receipt_path) return { ...t, receiptUrl: null };
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(t.receipt_path, 3600);
      return { ...t, receiptUrl: data?.signedUrl ?? null };
    }),
  );

  const { data: categories_list, error: categories_error } = await supabase
    .from("categories")
    .select("*");
  if (categories_error || !categories_list) {
    return <p>Could not fetch categories</p>;
  }

  console.log("List of transactions: ", transactions_list);

  return (
    <DashboardClient
      email={user.email!}
      display_name={user_profile.display_name}
      transactions_list={transactions_with_urls}
      categories_list={categories_list}
    />
  );
}
