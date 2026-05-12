import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <p>No user logged in</p>;

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

  console.log("List of transactions: ", transactions_list);

  return (
    <DashboardClient
      email={user.email!}
      display_name={user_profile.display_name}
      transactions_list={transactions_list}
    />
  );
}
