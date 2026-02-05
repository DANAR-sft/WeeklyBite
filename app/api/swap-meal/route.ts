import { NextRequest, NextResponse } from "next/server";
import { generateSwapMeal } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      preference,
      mealType,
      dietary_goals,
      dailyCalories,
      diet_type,
      allergies,
      cuisine_preferences,
      dislikes,
    } = body;

    if (!preference || !mealType || !dietary_goals || !dailyCalories) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await generateSwapMeal({
      preference,
      mealType,
      dietary_goals,
      dailyCalories,
      diet_type,
      allergies,
      cuisine_preferences,
      dislikes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating swap meal:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));

    // Return more detailed error
    return NextResponse.json(
      {
        error: "Failed to generate swap meal options",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
