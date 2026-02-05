"use server";

import { mealService } from "../services/prep-service";
import { MealPrepDb } from "../types/definitions";

export async function mealPrepPost({
  dietary_goals,
  diet_type,
  calories_target,
  allergies,
  cuisine_preferences,
  dislikes,
}: MealPrepDb) {
  try {
    const result = await mealService.postMealPrep({
      dietary_goals,
      diet_type,
      calories_target,
      allergies,
      cuisine_preferences,
      dislikes,
    });

    console.log("Meal prep data stored:", result);
    return result;
  } catch (error: any) {
    console.error("Error in mealPrepPost:", error);
    throw new Error(error || "Failed to save meal prep data");
  }
}
