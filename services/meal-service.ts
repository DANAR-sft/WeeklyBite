import { createClient } from "@/lib/supabase/server";
import {
  MealPlan,
  MealDb,
  GroceryItem,
  WeeklyMealPlanDb,
  MealsDb,
  GroceryListDb,
} from "../types/definitions";

export const mealPlanService = {
  async createFullPlan(
    userId: string,
    planHeader: Omit<MealPlan, "id" | "user_id">,
    mealsArray: Omit<MealDb, "id" | "meal_plan_id">[],
    groceryArray: any[],
  ) {
    const supabase = await createClient();
    const { data: plan, error: planErr } = await supabase
      .from("meal_plans")
      .insert([{ user_id: userId, ...planHeader }])
      .select()
      .single();
    if (planErr) throw planErr;

    const { data: insertedMeals, error: mealsErr } = await supabase
      .from("meals")
      .insert(mealsArray.map((m) => ({ ...m, meal_plan_id: plan.id })))
      .select();
    if (mealsErr) throw mealsErr;

    const groceriesToInsert = groceryArray.map((g) => {
      const meal = insertedMeals.find(
        (m) => m.recipe_name === g.temp_recipe_name,
      );
      return {
        meal_plan_id: plan.id,
        meal_id: meal?.id,
        ingredient_name: g.ingredient_name,
        quantity: g.quantity,
        category: g.category,
        estimated_price: g.estimated_price,
        is_bought: false,
      };
    });

    const { error: groceryErr } = await supabase
      .from("grocery_lists")
      .insert(groceriesToInsert);
    if (groceryErr) throw groceryErr;

    return plan.id;
  },

  async getLatestMealPlanByUserId(
    userId: string,
  ): Promise<WeeklyMealPlanDb | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as WeeklyMealPlanDb;
  },

  async getAllMealPlansByUserId(userId: string): Promise<WeeklyMealPlanDb[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data as WeeklyMealPlanDb[];
  },

  async getMealPlanById(planId: string): Promise<WeeklyMealPlanDb | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as WeeklyMealPlanDb;
  },

  async getFullMealPlan(planId: string): Promise<{
    plan: WeeklyMealPlanDb;
    meals: MealsDb[];
    groceries: GroceryListDb[];
  } | null> {
    const supabase = await createClient();

    const { data: plan, error: planErr } = await supabase
      .from("meal_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planErr) {
      if (planErr.code === "PGRST116") return null;
      throw planErr;
    }

    const { data: meals, error: mealsErr } = await supabase
      .from("meals")
      .select("*")
      .eq("meal_plan_id", planId)
      .order("day", { ascending: true });

    if (mealsErr) throw mealsErr;

    const { data: groceries, error: groceryErr } = await supabase
      .from("grocery_lists")
      .select("*")
      .eq("meal_plan_id", planId)
      .order("category", { ascending: true });

    if (groceryErr) throw groceryErr;

    return {
      plan: plan as WeeklyMealPlanDb,
      meals: meals as MealsDb[],
      groceries: groceries as GroceryListDb[],
    };
  },

  async updateMealPlanTotals(
    planId: string,
    totals: {
      total_weekly_calories: number;
      total_weekly_protein: number;
      total_weekly_carbs: number;
      total_weekly_fat: number;
    },
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("meal_plans")
      .update(totals)
      .eq("id", planId);

    if (error) throw error;
  },

  async deleteMealPlan(planId: string): Promise<void> {
    const supabase = await createClient();

    await supabase.from("grocery_lists").delete().eq("meal_plan_id", planId);

    await supabase.from("meals").delete().eq("meal_plan_id", planId);

    const { error } = await supabase
      .from("meal_plans")
      .delete()
      .eq("id", planId);

    if (error) throw error;
  },
};
