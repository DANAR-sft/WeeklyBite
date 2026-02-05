import { createClient } from "@/lib/supabase/server";
import { MealsDb, GroceryItemDb } from "../types/definitions";
import { groceryService } from "./grocery-service";

export const swapService = {
  /**
   * Swap meal dengan meal baru
   * 1. Update data meal di database
   * 2. Hapus grocery items lama dari meal tersebut
   * 3. Tambah grocery items baru dari meal pengganti
   */
  async swapMeal(
    mealId: string,
    mealPlanId: string,
    newMealData: Partial<MealsDb>,
    newGroceryItems?: Omit<GroceryItemDb, "id" | "meal_plan_id" | "meal_id">[],
  ): Promise<MealsDb> {
    const supabase = await createClient();

    const { data: updatedMeal, error: mealError } = await supabase
      .from("meals")
      .update({
        recipe_name: newMealData.recipe_name,
        description: newMealData.description,
        image_url: newMealData.image_url,
        calories: newMealData.calories,
        protein: newMealData.protein,
        carbs: newMealData.carbs,
        fat: newMealData.fat,
        is_swapped: true,
      })
      .eq("id", mealId)
      .select()
      .single();

    if (mealError) throw mealError;

    await groceryService.deleteGroceryByMealId(mealId);

    if (newGroceryItems && newGroceryItems.length > 0) {
      await groceryService.addGroceryItems(mealPlanId, mealId, newGroceryItems);
    }

    return updatedMeal as MealsDb;
  },

  async getMealById(mealId: string): Promise<MealsDb | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("id", mealId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return data as MealsDb;
  },

  async getMealsByPlanId(mealPlanId: string): Promise<MealsDb[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meals")
      .select("*")
      .eq("meal_plan_id", mealPlanId)
      .order("day", { ascending: true });

    if (error) throw error;

    return data as MealsDb[];
  },

  async revertSwap(mealId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("meals")
      .update({ is_swapped: false })
      .eq("id", mealId);

    if (error) throw error;
  },
};
