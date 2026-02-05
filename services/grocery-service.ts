import { createClient } from "@/lib/supabase/server";
import { GroceryItem, GroceryItemDb } from "../types/definitions";

export const groceryService = {
  async getGroceryList(mealPlanId: string): Promise<GroceryItemDb[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("meal_plan_id", mealPlanId)
      .order("category", { ascending: true });

    if (error) throw error;

    return data.map((item) => ({
      ...item,
      estimated_price: Number(item.estimated_price),
    })) as GroceryItemDb[];
  },

  async getGroceryByMealId(mealId: string): Promise<GroceryItemDb[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("meal_id", mealId)
      .order("category", { ascending: true });

    if (error) throw error;

    return data.map((item) => ({
      ...item,
      estimated_price: Number(item.estimated_price),
    })) as GroceryItemDb[];
  },

  async toggleBought(groceryId: string, currentStatus: boolean): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("grocery_lists")
      .update({ is_bought: !currentStatus })
      .eq("id", groceryId);

    if (error) throw error;
  },

  async getWeeklyBudget(mealPlanId: string): Promise<number> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("grocery_lists")
      .select("estimated_price")
      .eq("meal_plan_id", mealPlanId);

    if (error) throw error;

    const total = data.reduce(
      (sum, item) => sum + Number(item.estimated_price),
      0,
    );
    return total;
  },

  async addGroceryItems(
    mealPlanId: string,
    mealId: string,
    items: Omit<GroceryItemDb, "id" | "meal_plan_id" | "meal_id">[],
  ): Promise<GroceryItemDb[]> {
    const supabase = await createClient();

    const groceriesToInsert = items.map((item) => ({
      meal_plan_id: mealPlanId,
      meal_id: mealId,
      ingredient_name: item.ingredient_name,
      quantity: item.quantity,
      category: item.category,
      estimated_price: item.estimated_price,
      is_bought: false,
    }));

    const { data, error } = await supabase
      .from("grocery_lists")
      .insert(groceriesToInsert)
      .select();

    if (error) throw error;
    return data as GroceryItemDb[];
  },

  async deleteGroceryByMealId(mealId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("grocery_lists")
      .delete()
      .eq("meal_id", mealId);

    if (error) throw error;
  },

  async deleteGroceryItem(groceryId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("grocery_lists")
      .delete()
      .eq("id", groceryId);

    if (error) throw error;
  },
};
