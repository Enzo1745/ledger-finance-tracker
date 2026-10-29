"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import {
  addTransactionSchema,
  updateProfileSchema,
  uuidSchema,
} from "@/lib/schemas";
import { ActionState } from "./types";

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

  const result = updateProfileSchema.safeParse({
    display_name: formData.get("name"),
  });
  if (!result.success) {
    console.error("Invalid display name:", result.error.flatten().fieldErrors);
    return;
  }

  const { display_name } = result.data;

  const { data: user_profile, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();
  if (error || !user_profile) {
    console.error("Failed to load profile:", error);
    return;
  }

  await supabase.from("profiles").update({ display_name }).eq("id", user.id);

  revalidatePath("/dashboard");
}

export async function addTransaction(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = addTransactionSchema.safeParse({
    amount: formData.get("amount"),
    description: formData.get("description"),
    category_id: formData.get("category"),
    receipt_path: formData.get("path"),
  });
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      success: false,
    };
  }

  const { amount, description, category_id, receipt_path } = result.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return { errors: {}, message: "Not authenticated.", success: false };

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount: Math.round(amount * 100),
      description: description,
      category_id: category_id,
      receipt_path: receipt_path,
    });
    if (error) {
      throw error;
    }
    updateTag(`summary-${user!.id}`);
  } catch (err) {
    console.error("addTransaction failed:", err);
    return {
      errors: {},
      message: "Something went wrong. Please try again.",
      success: false,
    };
  }

  return { errors: {}, message: null, success: true };
}

export async function deleteTransaction(id: string) {
  // Server actions are public endpoints: the `string` type isn't enforced at runtime
  if (!uuidSchema.safeParse(id).success) return;

  const supabase = await createClient();

  // Fetch the path before deleting the row
  const { data: tx } = await supabase
    .from("transactions")
    .select("receipt_path")
    .eq("id", id)
    .single();

  await supabase.from("transactions").delete().eq("id", id);

  // Revalidate cached data
  const {
    data: { user },
  } = await supabase.auth.getUser();
  updateTag(`summary-${user!.id}`);

  // Clean up receipt file
  if (tx?.receipt_path) {
    await supabase.storage.from("receipts").remove([tx.receipt_path]);
  }
}

export async function duplicateTransaction(id: string) {
  if (!uuidSchema.safeParse(id).success) return { error: "Invalid ID" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: original } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();
  if (!original) return { error: "Transaction not found" };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount: original.amount,
    description: original.description,
    category_id: original.category_id,
  });
  if (error) return { error: error.message };

  updateTag(`summary-${user!.id}`);
  return { error: null };
}
