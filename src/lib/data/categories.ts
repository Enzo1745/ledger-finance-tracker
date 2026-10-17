import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export const getCategories = unstable_cache(
  async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    if (error) throw error;
    return data;
  },
  ["categories"],
  { tags: ["categories"], revalidate: 3600 },
);
