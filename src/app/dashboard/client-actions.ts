import { createClient } from "@/lib/supabase/client";
import type { Result } from "./types";

export const uploadReceipt = async (file: File): Promise<Result<string>> => {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("receipts")
      .upload(path, file);
    if (error) throw error;

    return { ok: true, data: path };
  } catch (err) {
    console.error("uploadReceipt:", err);
    return { ok: false, error: "Could not upload receipt" };
  }
};
