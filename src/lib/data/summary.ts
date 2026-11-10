import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MonthlySummary, Result } from "@/app/dashboard/types";

export const getMonthlySummary = (supabase: SupabaseClient, userId: string) =>
  unstable_cache(
    async (): Promise<Result<MonthlySummary>> => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false });
        if (error) throw error;

        const total = data.reduce((sum, t) => sum + t.amount, 0);
        return { ok: true, data: { total, transactions: data } };
      } catch (err) {
        console.error("getMonthlySummary:", err);
        return { ok: false, error: "Could not load monthly summary" };
      }
    },
    [`summary-${userId}`],
    { tags: [`summary-${userId}`], revalidate: 60 },
  )();
