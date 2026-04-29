"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function login(formData: FormData) {
  const next = formData.get("next") as string;
  console.log("next received in action:", JSON.stringify(next));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) redirect("/login?error=Invalid credentials");

  next ? redirect(next) : redirect("/dashboard");
}
