import { createClient } from "@/lib/supabase/server";
import { UserProfile } from "../types/definitions";

export const profileService = {
  async updateProfile(
    userId: string,
    profileData: Partial<UserProfile>,
  ): Promise<UserProfile> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  },

  async getProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as UserProfile;
  },

  async deleteProfile(userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },

  async hasProfile(userId: string): Promise<boolean> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) throw error;
    return (count ?? 0) > 0;
  },
};
