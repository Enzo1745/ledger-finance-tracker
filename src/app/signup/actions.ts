"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signupSchema } from "@/lib/schemas";

export async function signup(formData: FormData) {
  const result = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.success) {
    const message = result.error.issues[0].message;
    redirect("/signup?error=" + encodeURIComponent(message));
  }

  const { email, password } = result.data;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: "",
      },
    },
  });
  if (error) redirect("/signup?error=" + error.message);
  redirect("/signup?message=Check your email to confirm");
}
