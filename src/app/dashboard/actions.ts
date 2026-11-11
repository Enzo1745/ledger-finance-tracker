"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import {
  addTransactionSchema,
  dateRangeSchema,
  updateProfileSchema,
  uuidSchema,
} from "@/lib/schemas";
import { ActionState, FilterState, initialFilterState } from "./types";

// Generic, user-facing failure. The real error is only ever logged server-side.
const GENERIC_ERROR: ActionState = {
  errors: {},
  message: "Something went wrong. Please try again.",
  success: false,
};

const NOT_AUTHENTICATED: ActionState = {
  errors: {},
  message: "Not authenticated.",
  success: false,
};

// Note on cache invalidation: in Next 16, `revalidateTag(tag, profile)` is
// stale-while-revalidate (the user would still see old data right after their
// own mutation). `updateTag(tag)` is the Server-Action-only variant with
// read-your-own-writes semantics, so it's the right tag-based call here.

export async function signOut(): Promise<ActionState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    console.error("signOut failed:", err);
    return GENERIC_ERROR;
  }
  // redirect() throws a special NEXT_REDIRECT error, so it must stay outside try/catch
  redirect("/login");
}

export async function updateName(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = updateProfileSchema.safeParse({
    display_name: formData.get("name"),
  });
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      success: false,
    };
  }

  const { display_name } = result.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NOT_AUTHENTICATED;

    const { error } = await supabase
      .from("profiles")
      .update({ display_name })
      .eq("id", user.id);
    if (error) throw error;

    updateTag(`profile-${user.id}`);
  } catch (err) {
    console.error("updateName failed:", err);
    return GENERIC_ERROR;
  }

  return { errors: {}, message: "Name updated.", success: true };
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
    if (!user) return NOT_AUTHENTICATED;

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount: Math.round(amount * 100),
      description,
      category_id,
      receipt_path,
    });
    if (error) throw error;

    updateTag(`summary-${user.id}`);
  } catch (err) {
    console.error("addTransaction failed:", err);
    return GENERIC_ERROR;
  }

  return { errors: {}, message: null, success: true };
}

export async function deleteTransaction(id: string): Promise<ActionState> {
  // Server actions are public endpoints: the `string` type isn't enforced at runtime
  const result = uuidSchema.safeParse(id);
  if (!result.success) {
    return { errors: {}, message: "Invalid transaction.", success: false };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NOT_AUTHENTICATED;

    // Fetch the path before deleting the row
    const { data: tx, error: fetchError } = await supabase
      .from("transactions")
      .select("receipt_path")
      .eq("id", result.data)
      .single();
    if (fetchError) throw fetchError;

    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", result.data);
    if (deleteError) throw deleteError;

    updateTag(`summary-${user.id}`);

    // Clean up the receipt file. The row is already gone, so a failure here is
    // only logged (an orphaned file), not reported as a failed delete.
    if (tx?.receipt_path) {
      const { error: storageError } = await supabase.storage
        .from("receipts")
        .remove([tx.receipt_path]);
      if (storageError)
        console.error("deleteTransaction receipt cleanup:", storageError);
    }
  } catch (err) {
    console.error("deleteTransaction failed:", err);
    return GENERIC_ERROR;
  }

  return { errors: {}, message: null, success: true };
}

export async function duplicateTransaction(id: string): Promise<ActionState> {
  const result = uuidSchema.safeParse(id);
  if (!result.success) {
    return { errors: {}, message: "Invalid transaction.", success: false };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NOT_AUTHENTICATED;

    const { data: original, error: fetchError } = await supabase
      .from("transactions")
      .select("amount, description, category_id")
      .eq("id", result.data)
      .single();
    if (fetchError) throw fetchError;

    const { error: insertError } = await supabase.from("transactions").insert({
      user_id: user.id,
      amount: original.amount,
      description: original.description,
      category_id: original.category_id,
    });
    if (insertError) throw insertError;

    updateTag(`summary-${user.id}`);
  } catch (err) {
    console.error("duplicateTransaction failed:", err);
    return GENERIC_ERROR;
  }

  return { errors: {}, message: null, success: true };
}

export async function filterTransactions(
  prevState: FilterState,
  formData: FormData,
): Promise<FilterState> {
  if (formData.get("intent") === "clear") return initialFilterState;

  const result = dateRangeSchema.safeParse({
    from: formData.get("from"),
    to: formData.get("to"),
  });
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      success: false,
      transactions: prevState.transactions,
    };
  }

  const { from, to } = result.data;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ...NOT_AUTHENTICATED, transactions: null };

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: false });
    if (error) throw error;

    // Signed URLs expire, so they're generated per request
    const transactions = await Promise.all(
      data.map(async (t) => {
        if (!t.receipt_path) return { ...t, receiptUrl: null };
        const { data } = await supabase.storage
          .from("receipts")
          .createSignedUrl(t.receipt_path, 3600);
        return { ...t, receiptUrl: data?.signedUrl ?? null };
      }),
    );

    return { errors: {}, message: null, success: true, transactions };
  } catch (err) {
    console.error("filterTransactions failed:", err);
    return { ...GENERIC_ERROR, transactions: prevState.transactions };
  }
}
