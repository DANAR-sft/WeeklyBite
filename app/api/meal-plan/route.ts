import { NextResponse } from "next/server";
import generateMealPlan from "../../../src/lib/gemini";
import { mealPlanService } from "../../../services/meal-service";
import { prepService } from "../../../services/prep-service";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const params = {
      dietary_goals: body.dietary_goals,
      calories_target: body.calories_target,
      diet_type: body.diet_type,
      allergies: body.allergies,
      cuisine_preferences: body.cuisine_preferences,
      dislikes: body.dislikes,
    };

    // Generate meal plan dari AI
    const result = await generateMealPlan(params as any);

    // Cek apakah user login
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Jika user login, simpan ke database
    if (user) {
      try {
        // Simpan meal prep context
        await prepService.saveMealPrepContext(user.id, params);

        // Hitung weekly totals
        const weeklyTotals = result.days.reduce(
          (acc: any, day: any) => ({
            calories: acc.calories + (day.totals?.calories || 0),
            protein: acc.protein + (day.totals?.protein || 0),
            carbs: acc.carbs + (day.totals?.carbs || 0),
            fat: acc.fat + (day.totals?.fats || day.totals?.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 },
        );

        // Prepare meals array untuk database
        const mealsArray = result.days.flatMap((day: any) => {
          const meals = [];

          if (day.meals.breakfast) {
            meals.push({
              day: day.day,
              meal_type: "Breakfast",
              recipe_name: day.meals.breakfast.recipe_name || "",
              description: day.meals.breakfast.description || "",
              image_url: day.meals.breakfast.image_url || "",
              calories: day.meals.breakfast.calories || 0,
              protein: day.meals.breakfast.protein || 0,
              carbs: day.meals.breakfast.carbs || 0,
              fat: day.meals.breakfast.fats || day.meals.breakfast.fat || 0,
              is_swapped: false,
            });
          }

          if (day.meals.lunch) {
            meals.push({
              day: day.day,
              meal_type: "Lunch",
              recipe_name: day.meals.lunch.recipe_name || "",
              description: day.meals.lunch.description || "",
              image_url: day.meals.lunch.image_url || "",
              calories: day.meals.lunch.calories || 0,
              protein: day.meals.lunch.protein || 0,
              carbs: day.meals.lunch.carbs || 0,
              fat: day.meals.lunch.fats || day.meals.lunch.fat || 0,
              is_swapped: false,
            });
          }

          if (day.meals.dinner) {
            meals.push({
              day: day.day,
              meal_type: "Dinner",
              recipe_name: day.meals.dinner.recipe_name || "",
              description: day.meals.dinner.description || "",
              image_url: day.meals.dinner.image_url || "",
              calories: day.meals.dinner.calories || 0,
              protein: day.meals.dinner.protein || 0,
              carbs: day.meals.dinner.carbs || 0,
              fat: day.meals.dinner.fats || day.meals.dinner.fat || 0,
              is_swapped: false,
            });
          }

          if (day.meals.snacks && Array.isArray(day.meals.snacks)) {
            day.meals.snacks.forEach((snack: any) => {
              meals.push({
                day: day.day,
                meal_type: "Snack",
                recipe_name: snack.recipe_name || "",
                description: snack.description || "",
                image_url: snack.image_url || "",
                calories: snack.calories || 0,
                protein: snack.protein || 0,
                carbs: snack.carbs || 0,
                fat: snack.fats || snack.fat || 0,
                is_swapped: false,
              });
            });
          }

          return meals;
        });

        // Prepare grocery array dengan temp_recipe_name untuk mapping
        const groceryArray = (result.grocery_list || []).map((item: any) => ({
          ingredient_name: item.ingredient_name,
          quantity: item.quantity || "",
          category: item.category || "Other",
          estimated_price: item.estimated_price || 0,
          temp_recipe_name: item.recipe_name || null,
        }));

        // Simpan ke database
        const planId = await mealPlanService.createFullPlan(
          user.id,
          {
            start_date: new Date().toISOString().split("T")[0],
            total_weekly_calories: weeklyTotals.calories,
            total_weekly_protein: weeklyTotals.protein,
            total_weekly_carbs: weeklyTotals.carbs,
            total_weekly_fat: weeklyTotals.fat,
          },
          mealsArray,
          groceryArray,
        );

        // Return dengan planId untuk referensi
        return NextResponse.json({
          ok: true,
          data: result,
          planId,
          savedToDb: true,
        });
      } catch (dbError) {
        console.error("Error saving to database:", dbError);
        // Tetap return result meski gagal save ke DB
        return NextResponse.json({
          ok: true,
          data: result,
          savedToDb: false,
          dbError: String(dbError),
        });
      }
    }

    // User tidak login, return result tanpa save ke DB
    return NextResponse.json({ ok: true, data: result, savedToDb: false });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

/**
 * GET - Ambil meal plan terbaru user
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const plan = await mealPlanService.getLatestMealPlanByUserId(user.id);

    if (!plan) {
      return NextResponse.json({ ok: true, data: null });
    }

    const fullPlan = await mealPlanService.getFullMealPlan(plan.id!);

    return NextResponse.json({ ok: true, data: fullPlan });
  } catch (err) {
    console.error("GET /api/meal-plan error:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
