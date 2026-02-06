import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const authService = {
  async signUpNewUser(name: string, email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      redirect("/auth/register?message=" + encodeURIComponent(error.message));
    }
  },

  async signInWithEmail(email: string, password: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      redirect("/auth/login?message=" + encodeURIComponent(error.message));
    }
  },

  async signOut() {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { ok: false, error };
    }
    return { ok: true };
  },
};

export async function serviceCheckUser() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  return data.user;
}
