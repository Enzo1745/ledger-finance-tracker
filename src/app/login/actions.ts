"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas";
import type { ActionState } from "@/app/dashboard/types";

// Only allow same-origin relative paths ("/x", not "//evil.com") to avoid open redirects
const safeNext = (next: FormDataEntryValue | null) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";

export async function login(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
      success: false,
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(result.data);
    if (error) {
      // Expected failure (wrong password etc.): log it, keep the message vague
      console.error("login failed:", error);
      return { errors: {}, message: "Invalid credentials.", success: false };
    }
  } catch (err) {
    console.error("login failed:", err);
    return {
      errors: {},
      message: "Something went wrong. Please try again.",
      success: false,
    };
  }

  // redirect() throws NEXT_REDIRECT, so it must stay outside try/catch
  redirect(safeNext(formData.get("next")));
}
