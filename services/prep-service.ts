import { createClient } from "@/lib/supabase/server";
import { MealPrepDb } from "../types/definitions";

export const prepService = {
  async saveMealPrepContext(
    userId: string,
    prepData: MealPrepDb,
  ): Promise<MealPrepDb & { id: string }> {
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    const profileData = {
      user_id: userId,
      dietary_goals: prepData.dietary_goals,
      diet_type: prepData.diet_type,
      calories_target: prepData.calories_target,
      allergies: prepData.allergies,
      cuisine_preferences: prepData.cuisine_preferences,
      dislikes: prepData.dislikes,
    };

    let data, error;

    if (existing) {
      const result = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("user_id", userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new profile
      const result = await supabase
        .from("user_profiles")
        .insert(profileData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;
    return data as MealPrepDb & { id: string };
  },

  async getMealPrepContext(userId: string): Promise<MealPrepDb | null> {
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

    return data as MealPrepDb;
  },

  async deleteMealPrepContext(userId: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },
};

export const mealService = {
  async postMealPrep(prepData: MealPrepDb) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    return prepService.saveMealPrepContext(user.id, prepData);
  },
};
