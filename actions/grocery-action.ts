"use server";

import { groceryService } from "../services/grocery-service";
import { createClient } from "@/lib/supabase/server";
import { GroceryItemDb } from "../types/definitions";

/**
 * Toggle status is_bought pada grocery item
 */
export async function toggleGroceryBought(
  groceryId: string,
  currentStatus: boolean,
) {
  try {
    await groceryService.toggleBought(groceryId, currentStatus);
    return { ok: true };
  } catch (error: any) {
    console.error("Error toggling grocery bought:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Ambil grocery list berdasarkan meal plan ID
 */
export async function getGroceryList(mealPlanId: string) {
  try {
    const data = await groceryService.getGroceryList(mealPlanId);
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error getting grocery list:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Hitung total budget belanja mingguan
 */
export async function getWeeklyBudget(mealPlanId: string) {
  try {
    const total = await groceryService.getWeeklyBudget(mealPlanId);
    return { ok: true, data: total };
  } catch (error: any) {
    console.error("Error getting weekly budget:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Hapus grocery item
 */
export async function deleteGroceryItem(groceryId: string) {
  try {
    await groceryService.deleteGroceryItem(groceryId);
    return { ok: true };
  } catch (error: any) {
    console.error("Error deleting grocery item:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Tambah grocery items baru
 */
export async function addGroceryItems(
  mealPlanId: string,
  mealId: string,
  items: Omit<GroceryItemDb, "id" | "meal_plan_id" | "meal_id">[],
) {
  try {
    const data = await groceryService.addGroceryItems(
      mealPlanId,
      mealId,
      items,
    );
    return { ok: true, data };
  } catch (error: any) {
    console.error("Error adding grocery items:", error);
    return { ok: false, error: error.message };
  }
}
