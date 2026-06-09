"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateName(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: user_profile, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  if (error || !user_profile) {
    console.error("Failed to load profile:", error);
    return;
  }

  const name = formData.get("name") as string;

  await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", user.id);

  revalidatePath("/dashboard");
}

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const amountDollars = parseInt(formData.get("amount") as string);
  if (Number.isNaN(amountDollars)) return;

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount: Math.round(amountDollars * 100),
    description: formData.get("description") as string,
    category_id: formData.get("category") as string,
    receipt_path: formData.get("path") as string,
  });

  if (error) {
    console.error("Failed to insert transaction:", error);
    return;
  }

  revalidatePath("/dashboard");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  // Fetch the path before deleting the row
  const { data: tx } = await supabase
    .from("transactions")
    .select("receipt_path")
    .eq("id", id)
    .single();

  await supabase.from("transactions").delete().eq("id", id);

  // Clean up receipt file
  if (tx?.receipt_path) {
    await supabase.storage.from("receipts").remove([tx.receipt_path]);
  }

  revalidatePath("/dashboard");
}
