import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { Category, Result } from "@/app/dashboard/types";

export const getCategories = unstable_cache(
  async (): Promise<Result<Category[]>> => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      );
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;

      return { ok: true, data };
    } catch (err) {
      console.error("getCategories:", err);
      return { ok: false, error: "Could not load categories" };
    }
  },
  ["categories"],
  { tags: ["categories"], revalidate: 3600 },
);
