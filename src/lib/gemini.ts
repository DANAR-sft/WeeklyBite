import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

const ai = new GoogleGenAI({});

const MealPlanInput = z.object({
  dietary_goals: z.enum(["Weight Loss", "Muscle Gain", "Maintenance"]),
  diet_type: z.string().optional(),
  calories_target: z.number().int().positive(),
  allergies: z.array(z.string()).optional(),
  cuisine_preferences: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
});

const SwapMealPreferenceInput = z.object({
  preference: z.string(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snacks"]),
  dietary_goals: z.enum(["Weight Loss", "Muscle Gain", "Maintenance"]),
  dailyCalories: z.number().int().positive(),
  diet_type: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  cuisine_preferences: z.array(z.string()).optional(),
  dislikes: z.array(z.string()).optional(),
});

async function generateMealPlan(input: z.infer<typeof MealPlanInput>) {
  const params = MealPlanInput.parse(input);

  const cuisineGuidance =
    params.cuisine_preferences && params.cuisine_preferences.length > 0
      ? `\n\n🔴 CRITICAL CUISINE REQUIREMENT:
You MUST generate meals that are AUTHENTICALLY from the "${params.cuisine_preferences.join(", ")}" cuisine(s).

Examples for Indonesian cuisine:
- Breakfast: Nasi Uduk, Bubur Ayam, Lontong Sayur, Soto Ayam
- Lunch: Nasi Goreng, Rendang, Ayam Penyet, Gado-Gado, Pecel Lele
- Dinner: Sate Ayam, Ikan Bakar Kecap, Sop Buntut, Nasi Kuning
- Snacks: Pisang Goreng, Klepon, Lemper, Onde-onde

❌ DO NOT suggest Western dishes like "Pan-Seared", "Grilled Chicken Breast", "Caesar Salad" if Indonesian is requested.
✅ Use traditional cooking methods, local ingredients, and authentic recipe names.`
      : "";

  const prompt = `Generate a 7-day meal plan with the following parameters:
Goal: ${params.dietary_goals}
Daily Calories: ${params.calories_target} kcal
Diet Type: ${params.diet_type ?? "Standard"}
Allergies: ${params.allergies ?? "None"}
Cuisine Preference: ${params.cuisine_preferences ?? "No preference"}${cuisineGuidance}
Foods to Avoid: ${params.dislikes ?? "None"}

For each day provide:
- Breakfast (~25% of daily calories)
- Lunch (~35% of daily calories)
- Dinner (~30% of daily calories)
- Snacks (~10% of daily calories)

Each meal should include:
- recipe_name (appealing, specific, MUST match the cuisine preference)
- description (short)
- calories (kcal), protein, carbs, fats
 - image_url: string (https URL) — a publicly accessible image representing the recipe, derived from the recipe_name (for example an Unsplash, Pexels or cleanpng link). Do NOT return data URIs. Prefer high-quality photos, the image link must be available.

Ensure the meal plan meets these criteria:

Requirements:
- No meal repetition within 7 days
- Balanced macros:
  * Weight Loss: 30% protein, 40% carbs, 30% fat
  * Muscle Gain: 30% protein, 40% carbs, 30% fat
  * Maintenance: 25% protein, 45% carbs, 30% fat
- Realistic meals (not overly complicated)
- STRICTLY follow the specified cuisine preference - this is the TOP PRIORITY
- Avoid listed allergens & dislikes


Also produce a consolidated grocery list aggregated across all 7 days. For the grocery_list:
- Provide an array of grocery item objects aggregated from the 7-day plan.
- Each grocery item object must include the following keys and types:
  - id: string (UUID) — primary key for the grocery item
  - ingredient_name: string (text)
  - quantity: string (text) (example: "200gr", "2 pcs", "1 bundles", "1 jar", "1 bottle", "250ml").
  - category: string (text) — e.g., "Produce", "Dairy", "Protein", "Pantry"
  - estimated_price: numeric (Estimated price per item in rupiahs, e.g., 15000)
  - is_bought: boolean — default false; whether the item has been purchased
- Do not include aggregated numeric quantities in this format; the grocery list is a catalog of items with the above fields.

Return strictly as valid JSON with a top-level object in this exact shape:
{
  "days": [
    { "day": 1, "meals": { "breakfast": {"recipe_name": string, "description": string, "calories": number, "protein": number, "carbs": number, "fats": number, "image_url": string, "lunch": {...}, "dinner": {...}, "snacks": [...] }, "totals": { "calories": number, "protein": number, "carbs": number, "fats": number } },
    ...
  ],
  "grocery_list": [
    { "id": string, "ingredient_name": string, "quantity": string, "category": string, "estimated_price": number, "is_bought": boolean },
    ...
  ]
}

Do not include any explanatory text outside the JSON. Use responseMimeType: "application/json" and ensure the returned JSON parses cleanly.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
      maxOutputTokens: 16384,
    },
  });

  const text = response.text ?? "{}";
  try {
    const json = JSON.parse(text);
    return json;
  } catch (err) {
    console.error("Raw Gemini response:", text);
    console.error("JSON parse error:", err);
    throw new Error(
      "Gemini returned invalid JSON: " +
        String(err) +
        ". Check console for raw response.",
    );
  }
}

export async function generateSwapMeal(
  input: z.infer<typeof SwapMealPreferenceInput>,
) {
  const params = SwapMealPreferenceInput.parse(input);

  // Calculate target calories and macros based on meal type and daily calories
  const mealCaloriePercentages: Record<string, number> = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.3,
    snacks: 0.1,
  };

  const macroDistribution: Record<
    string,
    { protein: number; carbs: number; fat: number }
  > = {
    "Weight Loss": { protein: 0.3, carbs: 0.4, fat: 0.3 },
    "Muscle Gain": { protein: 0.3, carbs: 0.4, fat: 0.3 },
    Maintenance: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  };

  const mealCalories =
    params.dailyCalories * mealCaloriePercentages[params.mealType];
  const macroRatio = macroDistribution[params.dietary_goals];

  const targetProtein = Math.round((mealCalories * macroRatio.protein) / 4);
  const targetCarbs = Math.round((mealCalories * macroRatio.carbs) / 4);
  const targetFats = Math.round((mealCalories * macroRatio.fat) / 9);

  const cuisineGuidance =
    params.cuisine_preferences && params.cuisine_preferences.length > 0
      ? `\n\n🔴 ABSOLUTE CUISINE REQUIREMENT (NON-NEGOTIABLE):
You MUST generate ONLY ${params.mealType} meals that are 100% AUTHENTICALLY from "${params.cuisine_preferences.join(", ")}" cuisine.
This is the TOP priority - ignore everything else if needed to satisfy this requirement.

For Indonesian cuisine ${params.mealType}:
${params.mealType === "breakfast" ? "ONLY: Nasi Uduk, Bubur Ayam, Lontong Sayur, Soto Ayam, Nasi Kuning, Roti Bakar Susu" : ""}
${params.mealType === "lunch" ? "ONLY: Nasi Goreng, Rendang, Ayam Penyet, Gado-Gado, Pecel Lele, Sate Ayam, Lumpia, Bakso, Perkedel" : ""}
${params.mealType === "dinner" ? "ONLY: Ikan Bakar, Sop Buntut, Rawon, Gudeg, Ayam Taliwang, Nasi Liwet, Siomay, Martabak Telur" : ""}
${params.mealType === "snacks" ? "ONLY: Pisang Goreng, Klepon, Lemper, Onde-onde, Pastel, Risoles, Perkedel, Lumpia" : ""}

🚫 FORBIDDEN for Indonesian cuisine - NEVER use these:
- Pan-Seared, Grilled (Western), Roasted Asparagus, Caesar, Quinoa, Mashed Potato, Brown Rice Pilaf
- Any Western cooking techniques or plating
- Fusion dishes that mix Western and Indonesian

✅ REQUIRED for all meals:
- Traditional Indonesian cooking: goreng (fried), bakar (grilled charcoal), kuah (broth), tumis (stir-fry)
- Authentic Indonesian ingredients: kecap manis, sambal, terasi, coconut milk, lemongrass, galangal
- Authentic recipe names in Indonesian`
      : "";

  const prompt = `Generate 3 alternative ${params.mealType} meal options based on the user's preference.

User's Request/Preference: "${params.preference}"

Meal Plan Context:
Goal: ${params.dietary_goals}
Daily Calories: ${params.dailyCalories} kcal
Target ${params.mealType} Calories: ${Math.round(mealCalories)} kcal
Target Macros: Protein ${targetProtein}g, Carbs ${targetCarbs}g, Fats ${targetFats}g
Diet Type: ${params.diet_type ?? "Standard"}
Allergies: ${params.allergies ?? "None"}
Cuisine Preference: ${params.cuisine_preferences ?? "No preference"}${cuisineGuidance}
Foods to Avoid: ${params.dislikes ?? "None"}

For each meal option, provide:
- recipe_name (appealing, specific, MUST be authentic to the cuisine preference)
- description (short, 1-2 sentences)
- calories (kcal), protein, carbs, fats
- image_url: string (https URL) — a publicly accessible image representing the recipe, derived from the recipe_name (for example an Unsplash, Pexels or Freepik link). Do NOT return data URIs. Prefer high-quality photos, the image link must be available.
- grocery_items: array of ingredient objects needed for this meal, each with:
  - ingredient_name: string
  - quantity: string (e.g., "200gr", "2 pcs", "1 cup")
  - category: string (e.g., "Produce", "Dairy", "Protein", "Pantry")
  - estimated_price: number (in rupiahs, e.g., 15000)

Requirements:
- PRIORITY #1: Generate meals that STRICTLY match the specified cuisine preference
- PRIORITY #2: Match the user's preference/request while staying within the cuisine
- Each meal should be close to the target calorie and macro targets (within ±15%)
- No meal repetition
- Realistic and easy to prepare with locally available ingredients
- Avoid listed allergens & dislikes
- Respect the original meal plan's goal and dietary constraints

Return strictly as valid JSON with a top-level object in this exact shape:
{
  "mealOptions": [
    {
      "recipe_name": string,
      "description": string,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "image_url": string,
      "grocery_items": [
        {
          "ingredient_name": string,
          "quantity": string,
          "category": string,
          "estimated_price": number
        }
      ]
    },
    {
      "recipe_name": string,
      "description": string,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "image_url": string,
      "grocery_items": [
        {
          "ingredient_name": string,
          "quantity": string,
          "category": string,
          "estimated_price": number
        }
      ]
    },
    {
      "recipe_name": string,
      "description": string,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "image_url": string,
      "grocery_items": [
        {
          "ingredient_name": string,
          "quantity": string,
          "category": string,
          "estimated_price": number
        }
      ]
    }
  ]
}

Do not include any explanatory text outside the JSON. Use responseMimeType: "application/json" and ensure the returned JSON parses cleanly.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 16384,
    },
  });

  const text = response.text ?? "{}";
  try {
    const json = JSON.parse(text);
    return json;
  } catch (err) {
    console.error("Raw Gemini response:", text);
    console.error("JSON parse error:", err);
    throw new Error(
      "Gemini returned invalid JSON: " +
        String(err) +
        ". Check console for raw response.",
    );
  }
}

export default generateMealPlan;
