"use server";

import { mealPlanService } from "../services/meal-service";
import { createClient } from "@/lib/supabase/server";
import { MealPlan, MealDb } from "../types/definitions";

/**
 * Buat meal plan baru lengkap dengan meals dan grocery
 */
export async function createMealPlan(
  planHeader: Omit<MealPlan, "id" | "user_id">,
  mealsArray: Omit<MealDb, "id" | "meal_plan_id">[],
  groceryArray: any[],
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "User not authenticated" };
    }

    const planId = await mealPlanService.createFullPlan(
      user.id,
      planHeader,
      mealsArray,
      groceryArray,
    );

    return { ok: true, data: { planId } };
  } catch (error: any) {
    console.error("Error creating meal plan:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Ambil meal plan terbaru user
 */
export async function getLatestMealPlan() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "User not authenticated" };
    }

    const data = await mealPlanService.getLatestMealPlanByUserId(user.id);
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error getting latest meal plan:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Ambil semua meal plans user
 */
export async function getAllMealPlans() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, error: "User not authenticated" };
    }

    const data = await mealPlanService.getAllMealPlansByUserId(user.id);
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error getting all meal plans:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Ambil meal plan lengkap dengan meals dan groceries
 */
export async function getFullMealPlan(planId: string) {
  try {
    const data = await mealPlanService.getFullMealPlan(planId);
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error getting full meal plan:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Update totals meal plan
 */
export async function updateMealPlanTotals(
  planId: string,
  totals: {
    total_weekly_calories: number;
    total_weekly_protein: number;
    total_weekly_carbs: number;
    total_weekly_fat: number;
  },
) {
  try {
    await mealPlanService.updateMealPlanTotals(planId, totals);
    return { ok: true };
  } catch (error: any) {
    console.error("Error updating meal plan totals:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Hapus meal plan
 */
export async function deleteMealPlan(planId: string) {
  try {
    await mealPlanService.deleteMealPlan(planId);
    return { ok: true };
  } catch (error: any) {
    console.error("Error deleting meal plan:", error);
    return { ok: false, error: error.message };
  }
}
