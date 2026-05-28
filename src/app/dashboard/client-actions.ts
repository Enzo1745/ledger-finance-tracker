import { createClient } from "@/lib/supabase/client";

export const uploadReceipt = async (file: File) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const path = `${user.id}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("receipts").upload(path, file);
  if (error) throw error;
  return path;
};
