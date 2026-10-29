"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/schemas";
import { NextRequest } from "next/server";

export async function login(formData: FormData) {
  const next = formData.get("next") as string;
  console.log("next received in action:", JSON.stringify(next));

  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) {
    const message = result.error.issues[0].message;
    redirect("/login?error=" + encodeURIComponent(message));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(result.data);
  if (error) redirect("/login?error=Invalid credentials");

  next ? redirect(next) : redirect("/dashboard");
}
