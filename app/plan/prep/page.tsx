"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MealPrepDb } from "../../../types/definitions";

export default function PlanPage() {
  const router = useRouter();
  const [goal, setGoal] = useState("Muscle Gain");
  const [calories, setCalories] = useState(2800);
  const [diet, setDiet] = useState("Standard");
  const [allergies, setAllergies] = useState(["None"]);
  const [cuisine, setCuisine] = useState(["Indonesian", "Western"]);
  const [dislikes, setDislikes] = useState(["None"]);
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSavedPreferences = async () => {
      try {
        const res = await fetch("/api/prep-plan");
        const json = await res.json();

        if (json.ok && json.data) {
          const ctx = json.data;
          setGoal(ctx.dietary_goals || "Muscle Gain");
          setCalories(ctx.calories_target || 2800);
          setDiet(ctx.diet_type || "Standard");
          setAllergies(ctx.allergies || ["None"]);
          setCuisine(ctx.cuisine_preferences || ["Indonesian", "Western"]);
          setDislikes(ctx.dislikes || ["None"]);
        }
      } catch (e) {
        console.log("No saved preferences found, using defaults");
      } finally {
        setLoadingContext(false);
      }
    };

    loadSavedPreferences();
  }, []);

  useEffect(() => {
    if (loadingContext) return;
    switch (goal) {
      case "Muscle Gain":
        setCalories(2800);
        break;
      case "Weight Loss":
        setCalories(1800);
        break;
      case "Maintenance":
        setCalories(2300);
        break;
      default:
        setCalories(2800);
    }
  }, [goal, loadingContext]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: MealPrepDb = {
        dietary_goals: goal,
        diet_type: diet,
        calories_target: calories,
        allergies,
        cuisine_preferences: cuisine,
        dislikes,
      };

      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error || "Failed to generate meal plan");
      }

      try {
        localStorage.setItem("mealPlanResult", JSON.stringify(json.data));

        localStorage.setItem("mealPlanContext", JSON.stringify(payload));

        if (json.savedToDb) {
          console.log("Meal plan saved to database, Plan ID:", json.planId);
        } else {
          console.log(
            "Meal plan saved to localStorage only (user not logged in or DB error)",
          );
        }
      } catch (e: any) {
        console.error("Failed to save to localStorage:", e);
      }

      router.push("/plan/results");
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loadingContext) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f4f9f4]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007200] mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row-reverse w-full min-h-screen">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#38b000]"></div>
            <p className="text-white text-sm">AI is generating, please wait.</p>
          </div>
        </div>
      )}
      <div className="relative flex flex-col justify-start items-center gap-6 w-full min-h-[40vh] md:min-h-screen overflow-hidden box-border py-12 sm:py-20 md:bg-[url('/mealprep4.jpg')] bg-center bg-cover">
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-[#f4f9f4] py-8 md:py-12 px-4 sm:px-6 md:px-8 md:rounded-lg md:shadow-lg">
          <div className="w-full max-w-md">
            <div className="flex justify-center items-center mb-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#006400]">
                Create Your Meal Plan
              </h2>
            </div>
            <p className="text-sm sm:text-base text-[#008000] text-center mb-6 md:mb-8">
              Customize your weekly meal plan
            </p>

            <form onSubmit={handleSubmit}>
              <fieldset disabled={loading} className="space-y-4 md:space-y-6">
                {/* Goal */}
                <div>
                  <label
                    htmlFor="goal"
                    className="block text-xs sm:text-sm font-medium text-[#004b23] mb-2"
                  >
                    Goal
                  </label>
                  <select
                    id="goal"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#004b23] rounded-md bg-white text-sm sm:text-base text-[#004b23] focus:outline-none focus:border-[#38b000] focus:ring-2 focus:ring-[#70e000]/20 transition-all"
                  >
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calories"
                    className="block text-xs sm:text-sm font-medium text-[#004b23] mb-2"
                  >
                    Daily Calories
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="calories"
                      value={calories}
                      onChange={(e) => setCalories(Number(e.target.value))}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#004b23] rounded-md bg-white text-sm sm:text-base text-[#004b23] focus:outline-none focus:border-[#38b000] focus:ring-2 focus:ring-[#70e000]/20 transition-all"
                      placeholder="2,200"
                    />
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[#008000] font-medium">
                      kcal
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[#008000] mt-1">
                    Auto-suggested based on your goal
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="diet"
                    className="block text-xs sm:text-sm font-medium text-[#004b23] mb-2"
                  >
                    Diet
                  </label>
                  <select
                    id="diet"
                    value={diet}
                    onChange={(e) => setDiet(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#004b23] rounded-md bg-white text-sm sm:text-base text-[#004b23] focus:outline-none focus:border-[#38b000] focus:ring-2 focus:ring-[#70e000]/20 transition-all"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Vegan">Vegan</option>
                    <option value="Keto">Keto</option>
                    <option value="Paleo">Paleo</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="allergies"
                    className="block text-xs sm:text-sm font-medium text-[#004b23] mb-2"
                  >
                    Allergies
                  </label>
                  <input
                    id="allergies"
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies([e.target.value])}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#004b23] rounded-md bg-white text-sm sm:text-base text-[#004b23] focus:outline-none focus:border-[#38b000] focus:ring-2 focus:ring-[#70e000]/20 transition-all"
                    placeholder="None"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cuisine"
                    className="block text-xs sm:text-sm font-medium text-[#004b23] mb-2"
                  >
                    Cuisine Preference
                  </label>
                  <input
                    id="cuisine"
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine([e.target.value])}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#004b23] rounded-md bg-white text-sm sm:text-base text-[#004b23] focus:outline-none focus:border-[#38b000] focus:ring-2 focus:ring-[#70e000]/20 transition-all"
                    placeholder="Indonesian + Western"
                  />
                </div>

                <div>
                  <label
                    htmlFor="dislikes"
                    className="block text-xs sm:text-sm font-medium text-[#004b23] mb-2"
                  >
                    Food Dislikes
                  </label>
                  <input
                    id="dislikes"
                    type="text"
                    value={dislikes}
                    onChange={(e) => setDislikes([e.target.value])}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#004b23] rounded-md bg-white text-sm sm:text-base text-[#004b23] focus:outline-none focus:border-[#38b000] focus:ring-2 focus:ring-[#70e000]/20 transition-all"
                    placeholder="e.g. broccoli, mushrooms"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 sm:py-4 bg-[#38b000] disabled:opacity-60 hover:bg-[#70e000] text-white hover:text-[#004b23] font-semibold text-sm sm:text-base rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? "Generating..." : "Generate Meal Plan"}
                </button>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-[#008000]">
                  <span className="text-black text-base sm:text-lg">✓</span>
                  <span>Your preferences are saved automatically</span>
                </div>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
