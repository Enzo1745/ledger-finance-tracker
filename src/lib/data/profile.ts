import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Profile, Result } from "@/app/dashboard/types";

// Tagged so updateName can invalidate it with updateTag(`profile-${userId}`)
export const getProfile = (supabase: SupabaseClient, userId: string) =>
  unstable_cache(
    async (): Promise<Result<Profile>> => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .single();
        if (error) throw error;

        return { ok: true, data };
      } catch (err) {
        console.error("getProfile:", err);
        return { ok: false, error: "Could not load your profile" };
      }
    },
    [`profile-${userId}`],
    { tags: [`profile-${userId}`], revalidate: 3600 },
  )();
