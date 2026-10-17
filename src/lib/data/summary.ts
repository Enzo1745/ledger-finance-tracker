import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export const getMonthlySummary = (supabase: SupabaseClient, userId: string) =>
  unstable_cache(
    async () => {
      const now = new Date();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte(
          "date",
          new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        )
        .order("date", { ascending: false });
      if (error) throw error;

      const total = data.reduce((sum, t) => sum + t.amount, 0);
      return { total, transactions: data };
    },
    [`summary-${userId}`],
    { tags: [`summary-${userId}`], revalidate: 60 },
  )();
