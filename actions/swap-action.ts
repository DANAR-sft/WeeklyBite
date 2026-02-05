"use server";

import { swapService } from "../services/swap-service";
import { createClient } from "@/lib/supabase/server";
import { MealsDb, GroceryItemDb } from "../types/definitions";

/**
 * Swap meal dengan meal baru
 */
export async function swapMeal(
  mealId: string,
  mealPlanId: string,
  newMealData: Partial<MealsDb>,
  newGroceryItems?: Omit<GroceryItemDb, "id" | "meal_plan_id" | "meal_id">[],
) {
  try {
    const data = await swapService.swapMeal(
      mealId,
      mealPlanId,
      newMealData,
      newGroceryItems,
    );
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error swapping meal:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Ambil meal berdasarkan ID
 */
export async function getMealById(mealId: string) {
  try {
    const data = await swapService.getMealById(mealId);
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error getting meal:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Ambil semua meals dari meal plan
 */
export async function getMealsByPlanId(mealPlanId: string) {
  try {
    const data = await swapService.getMealsByPlanId(mealPlanId);
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error getting meals:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Revert swap meal
 */
export async function revertSwap(mealId: string) {
  try {
    await swapService.revertSwap(mealId);
    return { ok: true };
  } catch (error: any) {
    console.error("Error reverting swap:", error);
    return { ok: false, error: error.message };
  }
}
