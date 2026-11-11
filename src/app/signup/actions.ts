"use server";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/schemas";
import type { ActionState } from "@/app/dashboard/types";

export async function signup(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = signupSchema.safeParse({
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

  const { email, password } = result.data;

  try {
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
    if (error) throw error;
  } catch (err) {
    // Supabase's message can reveal whether an email is registered — keep it server-side
    console.error("signup failed:", err);
    return {
      errors: {},
      message: "Could not create your account. Please try again.",
      success: false,
    };
  }

  return {
    errors: {},
    message: "Check your email to confirm your account.",
    success: true,
  };
}
