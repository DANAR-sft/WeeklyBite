"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import GroceryList from "@/components/grocery-list";
import { jsPDF } from "jspdf";
import {
  MealLocal,
  MealPlanData,
  DayPlan,
  GroceryItem,
} from "../../../types/definitions";
import { toggleGroceryBought } from "../../../actions/grocery-action";

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<MealPlanData | null>(null);
  const [activeTab, setActiveTab] = useState<"meals" | "grocery">("meals");
  const [viewMode, setViewMode] = useState<"all" | "pagination">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [mealPlanContext, setMealPlanContext] = useState<any>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"db" | "localStorage" | null>(
    null,
  );

  // Helper function to transform DB data to MealPlanData format
  const transformDbToMealPlanData = (dbData: any): MealPlanData => {
    const { meals, groceries } = dbData;

    // Group meals by day
    const daysMap = new Map<number, any>();

    meals.forEach((meal: any) => {
      const dayNum = Number(meal.day);
      if (!daysMap.has(dayNum)) {
        daysMap.set(dayNum, {
          day: dayNum,
          meals: {
            breakfast: null,
            lunch: null,
            dinner: null,
            snacks: [],
          },
          totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
        });
      }

      const dayData = daysMap.get(dayNum);
      const mealData = {
        id: meal.id,
        recipe_name: meal.recipe_name,
        description: meal.description,
        image_url: meal.image_url,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fat, // DB uses 'fat', UI uses 'fats'
        is_swapped: meal.is_swapped,
      };

      switch (meal.meal_type) {
        case "Breakfast":
          dayData.meals.breakfast = mealData;
          break;
        case "Lunch":
          dayData.meals.lunch = mealData;
          break;
        case "Dinner":
          dayData.meals.dinner = mealData;
          break;
        case "Snack":
          dayData.meals.snacks.push(mealData);
          break;
      }
    });

    // Calculate totals for each day
    daysMap.forEach((day) => {
      const normalizeMeal = (m: any) => ({
        calories: m?.calories ?? 0,
        protein: m?.protein ?? 0,
        carbs: m?.carbs ?? 0,
        fats: m?.fats ?? 0,
      });

      const breakfast = normalizeMeal(day.meals.breakfast);
      const lunch = normalizeMeal(day.meals.lunch);
      const dinner = normalizeMeal(day.meals.dinner);
      const snacks = (day.meals.snacks || []).map(normalizeMeal);

      const snackTotals = snacks.reduce(
        (acc: any, s: any) => ({
          calories: acc.calories + s.calories,
          protein: acc.protein + s.protein,
          carbs: acc.carbs + s.carbs,
          fats: acc.fats + s.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      );

      day.totals = {
        calories:
          breakfast.calories +
          lunch.calories +
          dinner.calories +
          snackTotals.calories,
        protein:
          breakfast.protein +
          lunch.protein +
          dinner.protein +
          snackTotals.protein,
        carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snackTotals.carbs,
        fats: breakfast.fats + lunch.fats + dinner.fats + snackTotals.fats,
      };
    });

    // Sort days and convert to array
    const days = Array.from(daysMap.values()).sort((a, b) => a.day - b.day);

    // Transform groceries
    const grocery_list = groceries.map((g: any) => ({
      id: g.id,
      ingredient_name: g.ingredient_name,
      quantity: g.quantity,
      category: g.category,
      estimated_price: Number(g.estimated_price),
      price: Number(g.estimated_price),
      is_bought: g.is_bought,
      meal_plan_id: g.meal_plan_id,
      meal_id: g.meal_id,
    }));

    return { days, grocery_list };
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // Try to load from database first
        const res = await fetch("/api/meal-plan");
        const json = await res.json();

        if (json.ok && json.data) {
          const transformedData = transformDbToMealPlanData(json.data);
          setData(transformedData);
          setCurrentPlanId(json.data.plan.id);
          setDataSource("db");

          // Also load context from DB
          const contextRes = await fetch("/api/prep-plan");
          const contextJson = await contextRes.json();
          if (contextJson.ok && contextJson.data) {
            setMealPlanContext(contextJson.data);
          }

          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.log("Failed to load from DB, falling back to localStorage");
      }

      // Fallback to localStorage
      try {
        const raw = localStorage.getItem("mealPlanResult");
        if (raw) {
          const parsed = JSON.parse(raw) as MealPlanData;

          const normalizeMeal = (m: any) => ({
            calories: m?.calories ?? 0,
            protein: m?.protein ?? m?.protein_g ?? 0,
            carbs: m?.carbs ?? m?.carbs_g ?? 0,
            fats: m?.fats ?? m?.fats_g ?? 0,
          });

          const days = (parsed.days || []).map((day) => {
            const breakfast = normalizeMeal(day.meals?.breakfast || {});
            const lunch = normalizeMeal(day.meals?.lunch || {});
            const dinner = normalizeMeal(day.meals?.dinner || {});
            const snacks = (day.meals?.snacks || []).map(normalizeMeal);

            const snackTotals = snacks.reduce(
              (acc, s) => ({
                calories: acc.calories + s.calories,
                protein: acc.protein + s.protein,
                carbs: acc.carbs + s.carbs,
                fats: acc.fats + s.fats,
              }),
              { calories: 0, protein: 0, carbs: 0, fats: 0 },
            );

            const totals = {
              calories:
                breakfast.calories +
                lunch.calories +
                dinner.calories +
                snackTotals.calories,
              protein:
                breakfast.protein +
                lunch.protein +
                dinner.protein +
                snackTotals.protein,
              carbs:
                breakfast.carbs +
                lunch.carbs +
                dinner.carbs +
                snackTotals.carbs,
              fats:
                breakfast.fats + lunch.fats + dinner.fats + snackTotals.fats,
            };

            return { ...day, totals };
          });

          const updated = { ...parsed, days };
          setData(updated);
          setDataSource("localStorage");

          try {
            localStorage.setItem("mealPlanResult", JSON.stringify(updated));
          } catch (err) {
            console.error("persist normalized totals", err);
          }
        }

        const contextRaw = localStorage.getItem("mealPlanContext");
        if (contextRaw) {
          setMealPlanContext(JSON.parse(contextRaw));
        }
      } catch (e) {
        setData(null);
      }

      setIsLoading(false);
    };

    loadData();
  }, []);

  // Handler untuk toggle grocery bought (dengan support database)
  const handleToggleBought = async (itemId: string, isBought: boolean) => {
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev } as MealPlanData;
      next.grocery_list = next.grocery_list.map((it) =>
        it.id === itemId ? { ...it, is_bought: isBought } : it,
      );
      return next;
    });

    // If data from DB, update via API
    if (dataSource === "db") {
      try {
        const result = await toggleGroceryBought(itemId, !isBought);
        if (!result.ok) {
          console.error("Failed to toggle in DB:", result.error);
          // Revert on error
          setData((prev) => {
            if (!prev) return prev;
            const next = { ...prev } as MealPlanData;
            next.grocery_list = next.grocery_list.map((it) =>
              it.id === itemId ? { ...it, is_bought: !isBought } : it,
            );
            return next;
          });
        }
      } catch (err) {
        console.error("Error toggling grocery:", err);
      }
    } else {
      // Save to localStorage
      setData((prev) => {
        if (!prev) return prev;
        try {
          localStorage.setItem("mealPlanResult", JSON.stringify(prev));
        } catch (err) {
          console.error("persist grocery toggle", err);
        }
        return prev;
      });
    }
  };

  const handleMealSwapped = (
    dayNum: number,
    mealType: string,
    newMeal: any,
  ) => {
    setData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev };
      const dayIndex = updated.days.findIndex((d) => d.day === dayNum);
      if (dayIndex === -1) return prev;

      const day = { ...updated.days[dayIndex] };
      const meals = { ...day.meals };

      if (mealType === "snacks") {
        // For snacks, we might need to handle array
        meals.snacks = [newMeal];
      } else {
        meals[mealType as keyof typeof meals] = newMeal;
      }

      day.meals = meals;

      // Recalculate totals (normalize keys and support legacy *_g fields)
      const normalizeMeal = (m: any) => ({
        calories: m?.calories ?? 0,
        protein: m?.protein ?? m?.protein_g ?? 0,
        carbs: m?.carbs ?? m?.carbs_g ?? 0,
        fats: m?.fats ?? m?.fats_g ?? 0,
      });

      const breakfast = normalizeMeal(meals.breakfast);
      const lunch = normalizeMeal(meals.lunch);
      const dinner = normalizeMeal(meals.dinner);
      const snacks = (meals.snacks || []).map((s: any) => normalizeMeal(s));

      const snackTotals = snacks.reduce(
        (acc, s) => ({
          calories: acc.calories + s.calories,
          protein: acc.protein + s.protein,
          carbs: acc.carbs + s.carbs,
          fats: acc.fats + s.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 },
      );

      day.totals = {
        calories:
          breakfast.calories +
          lunch.calories +
          dinner.calories +
          snackTotals.calories,
        protein:
          breakfast.protein +
          lunch.protein +
          dinner.protein +
          snackTotals.protein,
        carbs: breakfast.carbs + lunch.carbs + dinner.carbs + snackTotals.carbs,
        fats: breakfast.fats + lunch.fats + dinner.fats + snackTotals.fats,
      };

      updated.days[dayIndex] = day;

      // Update grocery list with new meal's ingredients
      if (newMeal.grocery_items && Array.isArray(newMeal.grocery_items)) {
        const newGroceryItems = newMeal.grocery_items.map((item: any) => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ingredient_name: item.ingredient_name,
          quantity: item.quantity,
          category: item.category,
          estimated_price: item.estimated_price,
          price: item.estimated_price,
          is_bought: false,
          meal_plan_id: `Day ${dayNum} - ${mealType}`,
          notes: `Added from swapped ${mealType}`,
        }));

        // Append new grocery items to existing list
        updated.grocery_list = [
          ...(updated.grocery_list || []),
          ...newGroceryItems,
        ];
      }

      // Save to localStorage
      try {
        localStorage.setItem("mealPlanResult", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save updated meal plan", err);
      }

      return updated;
    });
  };

  const generateGroceryListPDF = (data: MealPlanData) => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const maxWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 75, 35);
    doc.text("Weekly Grocery List", margin, yPosition);
    yPosition += 12;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      margin,
      yPosition,
    );
    yPosition += 10;

    // Group items by category
    const categorizedItems: { [key: string]: GroceryItem[] } = {};
    data.grocery_list.forEach((item) => {
      const category = item.category || "Other";
      if (!categorizedItems[category]) {
        categorizedItems[category] = [];
      }
      categorizedItems[category].push(item);
    });

    // Draw categories and items
    doc.setFontSize(12);
    Object.keys(categorizedItems).forEach((category) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }

      // Category header
      doc.setTextColor(0, 114, 0);
      doc.setFont("helvetica", "bold");
      doc.text(category, margin, yPosition);
      yPosition += 8;

      // Items in category
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      categorizedItems[category].forEach((item) => {
        if (yPosition > pageHeight - 15) {
          doc.addPage();
          yPosition = 20;
        }

        const itemText = `- ${item.ingredient_name} - ${item.quantity || ""}`;
        doc.text(itemText, margin + 5, yPosition);

        // Add price if available
        if (item.estimated_price || item.price) {
          const priceText = `Rp${(item.estimated_price || item.price || 0).toLocaleString()}`;
          doc.setTextColor(150, 150, 150);
          doc.setFontSize(9);
          doc.text(priceText, pageWidth - margin - 40, yPosition);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
        }

        yPosition += 7;
      });

      yPosition += 5;
    });

    // Summary
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0, 75, 35);
    doc.text("Summary", margin, yPosition);
    yPosition += 8;

    const totalItems = data.grocery_list.length;
    const boughtItems = data.grocery_list.filter((i) => i.is_bought).length;
    const totalPrice = data.grocery_list.reduce(
      (sum, item) => sum + (item.estimated_price || item.price || 0),
      0,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Items: ${totalItems}`, margin, yPosition);
    yPosition += 7;
    doc.text(
      `Estimated Total: Rp${totalPrice.toLocaleString()}`,
      margin,
      yPosition,
    );

    // Save PDF
    doc.save("grocery-list.pdf");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007200] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your meal plan...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="min-h-screen bg-[#f4f9f4] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No meal plan found.</p>
          <button
            onClick={() => router.push("/plan/prep")}
            className="px-6 py-2 bg-[#007200] text-white rounded-lg hover:bg-[#70e000] hover:text-[#004b23] transition-colors"
          >
            Create Your Meal Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="tabs" className="min-h-screen bg-[#f4f9f4] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Data Source Indicator */}
        {dataSource && (
          <div className="mb-4 text-center">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                dataSource === "db"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {dataSource === "db"
                ? "✓ Synced with cloud"
                : "⚠ Local storage only"}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-[#004b23] mb-2">
            Your 7-Day Meal Plan
          </h1>
          <p className="text-gray-600">
            Personalized nutrition plan for your goals
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-row justify-center sm:justify-start">
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("meals")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "meals"
                  ? "text-[#007200] border-b-2 border-[#007200]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Meal Plan
            </button>
            <button
              onClick={() => setActiveTab("grocery")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "grocery"
                  ? "text-[#007200] border-b-2 border-[#007200]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Grocery List
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4 justify-center sm:justify-end">
          <button
            onClick={() => router.push("/plan/prep")}
            className="text-xs px-3 py-1  sm:px-6 sm:py-2 border border-[#007200] text-[#007200] rounded-lg hover:bg-[#007200] hover:text-white transition-colors"
          >
            Create New Plan
          </button>
          <button
            onClick={() => window.print()}
            className="text-xs px-3 py-1  sm:px-6 sm:py-2 bg-[#007200] text-white rounded-lg hover:bg-[#70e000] hover:text-[#004b23] transition-colors"
          >
            Print Plan
          </button>

          {activeTab === "grocery" && data && (
            <button
              onClick={() => generateGroceryListPDF(data)}
              className="text-xs px-3 py-1  sm:px-6 sm:py-2 bg-[#007200] text-white rounded-lg hover:bg-[#70e000] hover:text-[#004b23] transition-colors"
            >
              Download as PDF
            </button>
          )}
        </div>

        {/* Weekly Summary Card */}
        {activeTab === "meals" && data && <WeeklySummaryCard data={data} />}
        {/* View Mode Toggle - Only for Meal Plan */}
        {activeTab === "meals" && data && (
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">
              {viewMode === "pagination"
                ? `Viewing Day ${currentPage} of ${data!.days?.length || 0}`
                : `Viewing all ${data!.days?.length || 0} days`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setViewMode("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "all"
                    ? "bg-[#007200] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Show All
              </button>
              <button
                onClick={() => setViewMode("pagination")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "pagination"
                    ? "bg-[#007200] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Show per day
              </button>
            </div>
          </div>
        )}

        {/* Meal Plan View */}
        {activeTab === "meals" && data && (
          <>
            <div className="space-y-6">
              {viewMode === "all"
                ? data!.days?.map((day) => (
                    <DayCard
                      key={day.day}
                      day={day}
                      mealPlanContext={mealPlanContext}
                      onMealSwapped={handleMealSwapped}
                    />
                  ))
                : data!.days
                    ?.filter((day) => day.day === currentPage)
                    .map((day) => (
                      <DayCard
                        key={day.day}
                        day={day}
                        mealPlanContext={mealPlanContext}
                        onMealSwapped={handleMealSwapped}
                      />
                    ))}
            </div>

            {/* Pagination Controls */}
            {viewMode === "pagination" &&
              data &&
              data.days &&
              data.days.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="hidden md:block px-6 py-1 bg-white border border-[#007200] text-[#007200] rounded-lg hover:bg-[#007200] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#007200] w-full sm:w-auto"
                  >
                    Prev Day
                  </button>

                  {/* Page Indicators */}
                  <div className="flex gap-2 flex-wrap justify-center">
                    {data!.days!.map((day) => (
                      <button
                        key={day.day}
                        onClick={() => setCurrentPage(day.day)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === day.day
                            ? "bg-[#007200] text-white"
                            : "bg-white border border-gray-300 text-gray-600 hover:border-[#007200] hover:text-[#007200]"
                        }`}
                      >
                        {day.day}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(data!.days?.length || 1, p + 1),
                      )
                    }
                    disabled={currentPage === (data!.days?.length || 1)}
                    className="hidden md:block px-6 py-1 bg-white border border-[#007200] text-[#007200] rounded-lg hover:bg-[#007200] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#007200] w-full sm:w-auto"
                  >
                    Next Day
                  </button>
                </div>
              )}
          </>
        )}

        {/* Grocery List View */}
        {activeTab === "grocery" && data && (
          <>
            <GroceryList data={data} onToggleBought={handleToggleBought} />
          </>
        )}

        {viewMode === "all" || activeTab === "grocery" ? (
          <div className="mt-2 ml-2">
            <a href="#tabs" className="text-sm text-gray-500 hover:underline">
              Back to Top
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WeeklySummaryCard({ data }: { data: MealPlanData }) {
  const [showSummary, setShowSummary] = useState(true);

  // Calculate weekly averages
  const averages = {
    calories:
      data.days && data.days.length > 0
        ? Math.round(
            data.days.reduce(
              (sum, day) => sum + (day.totals?.calories || 0),
              0,
            ) / data.days.length,
          )
        : 0,
    protein:
      data.days && data.days.length > 0
        ? Math.round(
            data.days.reduce(
              (sum, day) => sum + (day.totals?.protein || 0),
              0,
            ) / data.days.length,
          )
        : 0,
    carbs:
      data.days && data.days.length > 0
        ? Math.round(
            data.days.reduce((sum, day) => sum + (day.totals?.carbs || 0), 0) /
              data.days.length,
          )
        : 0,
    fat:
      data.days && data.days.length > 0
        ? Math.round(
            data.days.reduce((sum, day) => sum + (day.totals?.fats || 0), 0) /
              data.days.length,
          )
        : 0,
  };

  // Calculate weekly totals
  const totals = {
    calories:
      data.days && data.days.length > 0
        ? data.days.reduce((sum, day) => sum + (day.totals?.calories || 0), 0)
        : 0,
    protein:
      data.days && data.days.length > 0
        ? Math.round(
            data.days.reduce((sum, day) => sum + (day.totals?.protein || 0), 0),
          )
        : 0,
    carbs:
      data.days && data.days.length > 0
        ? Math.round(
            data.days.reduce((sum, day) => sum + (day.totals?.carbs || 0), 0),
          )
        : 0,
    fat:
      data.days && data.days.length > 0
        ? Math.round(
            data.days.reduce((sum, day) => sum + (day.totals?.fats || 0), 0),
          )
        : 0,
  };

  // Calculate macronutrient percentages
  const totalMacros =
    averages.protein * 4 + averages.carbs * 4 + averages.fat * 9;
  const proteinPercent =
    totalMacros > 0
      ? Math.round(((averages.protein * 4) / totalMacros) * 100)
      : 0;
  const carbsPercent =
    totalMacros > 0
      ? Math.round(((averages.carbs * 4) / totalMacros) * 100)
      : 0;
  const fatsPercent =
    totalMacros > 0 ? Math.round(((averages.fat * 9) / totalMacros) * 100) : 0;

  return (
    <Card className="mb-6 bg-linear-to-r from-[#007200]/5 to-[#70e000]/5 border-[#007200]/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#004b23]">
            Weekly Summary
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSummary(true)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                showSummary
                  ? "bg-[#007200] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Show
            </button>
            <button
              onClick={() => setShowSummary(false)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                !showSummary
                  ? "bg-[#007200] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </CardHeader>
      {showSummary && (
        <CardContent>
          <div className="space-y-6">
            {/* Average Daily */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Average Daily
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Avg Daily Calories */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Avg Daily</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {averages.calories.toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-medium">kcal</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">per day</p>
                </div>

                {/* Protein */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Protein</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {averages.protein}
                    </span>
                    <span className="text-gray-500 font-medium">g/day</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ({proteinPercent}%)
                  </p>
                </div>

                {/* Carbs */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Carbs</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {averages.carbs}
                    </span>
                    <span className="text-gray-500 font-medium">g/day</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ({carbsPercent}%)
                  </p>
                </div>

                {/* Fats */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Fats</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {averages.fat}
                    </span>
                    <span className="text-gray-500 font-medium">g/day</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">({fatsPercent}%)</p>
                </div>
              </div>
            </div>

            {/* Weekly Total */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Weekly Total (7 days)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Calories */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Total Calories</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {totals.calories.toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-medium">kcal</span>
                  </div>
                </div>

                {/* Total Protein */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Total Protein</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {totals.protein}
                    </span>
                    <span className="text-gray-500 font-medium">g</span>
                  </div>
                </div>

                {/* Total Carbs */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Total Carbs</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {totals.carbs}
                    </span>
                    <span className="text-gray-500 font-medium">g</span>
                  </div>
                </div>

                {/* Total Fats */}
                <div className="flex flex-col items-start p-4 bg-white rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Total Fats</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[#007200]">
                      {totals.fat}
                    </span>
                    <span className="text-gray-500 font-medium">g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function DayCard({
  day,
  mealPlanContext,
  onMealSwapped,
}: {
  day: DayPlan;
  mealPlanContext: any;
  onMealSwapped: (dayNum: number, mealType: string, newMeal: any) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#007200] text-white px-4 py-3 rounded-lg gap-2 w-[90%] sm:w-[96%] mx-auto">
        <CardTitle className="text-xl">Day {day.day}</CardTitle>
        {day.totals && (
          <div className="text-sm opacity-90 mt-2 sm:mt-0 flex flex-wrap gap-2">
            <span>Daily Total: {day.totals.calories} kcal</span>
            <span>•</span>
            <span>Protein: {day.totals.protein}g</span>
            <span>•</span>
            <span>Carbs: {day.totals.carbs}g</span>
            <span>•</span>
            <span>Fats: {day.totals.fats}g</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          {/* Breakfast */}
          {day.meals.breakfast && (
            <MealCard
              title="Breakfast"
              meal={day.meals.breakfast}
              mealType="breakfast"
              dayNum={day.day}
              mealPlanContext={mealPlanContext}
              onMealSwapped={onMealSwapped}
            />
          )}

          {/* Lunch */}
          {day.meals.lunch && (
            <MealCard
              title="Lunch"
              meal={day.meals.lunch}
              mealType="lunch"
              dayNum={day.day}
              mealPlanContext={mealPlanContext}
              onMealSwapped={onMealSwapped}
            />
          )}

          {/* Dinner */}
          {day.meals.dinner && (
            <MealCard
              title="Dinner"
              meal={day.meals.dinner}
              mealType="dinner"
              dayNum={day.day}
              mealPlanContext={mealPlanContext}
              onMealSwapped={onMealSwapped}
            />
          )}

          {/* Snacks - rendered as individual cards like other meals */}
          {day.meals.snacks &&
            day.meals.snacks.length > 0 &&
            day.meals.snacks.map((snack, idx) => (
              <MealCard
                key={idx}
                title={`Snack`}
                meal={snack}
                mealType="snacks"
                dayNum={day.day}
                mealPlanContext={mealPlanContext}
                onMealSwapped={onMealSwapped}
              />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SwapMealModal({
  mealTitle,
  mealType,
  mealPlanContext,
  onClose,
  onMealSelected,
}: {
  mealTitle: string;
  mealType: string;
  mealPlanContext: any;
  onClose: () => void;
  onMealSelected: (meal: any) => void;
}) {
  const [preference, setPreference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mealOptions, setMealOptions] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preference.trim()) return;

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/swap-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preference: preference,
          mealType: mealType,
          dietary_goals: mealPlanContext?.goal || "Maintenance",
          dailyCalories: mealPlanContext?.calories || 2000,
          diet_type: mealPlanContext?.diet_type,
          allergies: mealPlanContext?.allergies,
          cuisine_preferences: mealPlanContext?.cuisine,
          dislikes: mealPlanContext?.dislikes,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate meal options");
      }

      const data = await response.json();
      setMealOptions(data.mealOptions || []);
    } catch (error) {
      console.error("Error swapping meal:", error);
      setError("Failed to generate meal options. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMeal = (meal: any) => {
    onMealSelected({
      name: meal.recipe_name,
      recipe_name: meal.recipe_name,
      description: meal.description,
      calories: meal.calories,
      protein: meal.protein ?? meal.protein_g ?? 0,
      carbs: meal.carbs ?? meal.carbs_g ?? 0,
      fats: meal.fats ?? meal.fats_g ?? 0,
      image_url: meal.image_url,
      grocery_items: meal.grocery_items || [],
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 h-screen"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <Card
          className="w-full max-w-3xl my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-[#004b23]">
              Swap {mealTitle}
            </CardTitle>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isLoading) onClose();
              }}
              className={`text-gray-500 text-2xl leading-none flex items-center justify-center w-8 h-8 rounded transition-colors ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
              type="button"
              disabled={isLoading}
            >
              ×
            </button>
          </CardHeader>
          <CardContent onClick={(e) => e.stopPropagation()}>
            {mealOptions.length === 0 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you prefer?
                  </label>
                  <textarea
                    value={preference}
                    onChange={(e) => setPreference(e.target.value)}
                    placeholder="e.g., so boring, i want fish dish"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007200] resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#007200] text-white rounded-lg hover:bg-[#70e000] hover:text-[#004b23] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !preference.trim()}
                  >
                    {isLoading ? "Generating..." : "Get Options"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                  Select a meal option to replace your current {mealTitle}:
                </div>

                <div className="space-y-3 max-h-125 overflow-y-auto">
                  {mealOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#007200] hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleSelectMeal(option)}
                    >
                      <div className="flex gap-4">
                        {option.image_url && (
                          <div className="shrink-0 w-24 h-24 rounded overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={option.image_url}
                              alt={option.recipe_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/defaultmeal.png";
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {option.recipe_name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {option.description}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                            <span className="font-medium">
                              {option.calories} kcal
                            </span>
                            <span>
                              Protein: {option.protein ?? option.protein_g}g
                            </span>
                            <span>
                              Carbs: {option.carbs ?? option.carbs_g}g
                            </span>
                            <span>Fats: {option.fats ?? option.fats_g}g</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <button
                    onClick={() => {
                      setMealOptions([]);
                      setPreference("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function MealCard({
  title,
  meal,
  mealType,
  dayNum,
  mealPlanContext,
  onMealSwapped,
}: {
  title: string;
  meal: MealLocal;
  mealType: string;
  dayNum: number;
  mealPlanContext: any;
  onMealSwapped: (dayNum: number, mealType: string, newMeal: any) => void;
}) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  useEffect(() => {
    // Prefer meal.image_url from stored meal data. If not available, look for a mapping in localStorage under `mealImages`.
    if (meal.image_url) {
      setImgUrl(meal.image_url);
      return;
    }

    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("mealImages")
          : null;
      if (raw) {
        const map = JSON.parse(raw) as Record<string, string>;
        const found =
          map[meal.recipe_name || ""] ??
          (meal.recipe_name ? map[meal.recipe_name] : undefined) ??
          null;
        if (found) setImgUrl(found);
      }
    } catch (err) {
      // ignore
    }
  }, [meal]);

  const handleMealSwapped = (newMeal: any) => {
    onMealSwapped(dayNum, mealType, newMeal);
  };

  return (
    <>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative border border-gray-200 rounded-lg overflow-hidden bg-white transition-shadow duration-300 ${
          hovered ? "shadow-lg" : "shadow-sm"
        }`}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image column with overlay effect */}
          <div
            className={`flex flex-1 shrink-0 bg-gray-100 w-full sm:w-48 h-88 overflow-hidden`}
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            {imgUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={
                    meal.description
                      ? `${meal.recipe_name} - ${meal.description}`
                      : meal.recipe_name
                  }
                  className={`object-cover w-full h-full transition-transform duration-300 ease-out ${
                    imgHovered
                      ? "absolute inset-0 w-full h-full scale-105 z-30"
                      : "w-full h-full " + (hovered ? "scale-110" : "scale-100")
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/defaultmeal.png";
                  }}
                />
                {/* Gradient overlay and text when image is hovered */}
                {imgHovered && (
                  <div className="absolute inset-0 z-40 bg-linear-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 animate-in fade-in duration-300">
                    {meal.recipe_name && (
                      <h4 className="text-white text-lg font-bold mb-2 drop-shadow-lg line-clamp-2">
                        {meal.recipe_name}
                      </h4>
                    )}
                    {meal.description && (
                      <p className="text-white/90 text-sm mb-3 line-clamp-3">
                        {meal.description}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-48 flex items-center justify-center text-sm text-gray-500">
                No image
              </div>
            )}
          </div>

          {/* Content column */}
          <div
            className={`p-5 flex-1 flex flex-col justify-between transition-opacity duration-200 ${imgHovered ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <h3 className="font-semibold text-[#004b23] mb-1 text-lg sm:text-2xl">
              {title}
            </h3>
            {meal.recipe_name && (
              <div className="font-medium text-gray-800 text-lg">
                {meal.recipe_name}
              </div>
            )}
            {meal.description && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {meal.description}
              </p>
            )}

            <div className="mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500 flex flex-wrap gap-3">
              <span className="font-medium">{meal.calories ?? 0} kcal</span>
              <span>
                Protein: {meal.protein ?? (meal as any).protein_g ?? 0}g
              </span>
              <span>Carbs: {meal.carbs ?? (meal as any).carbs_g ?? 0}g</span>
              <span>Fats: {meal.fats ?? (meal as any).fats_g ?? 0}g</span>
            </div>

            {/* Swap Meal Button */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowSwapModal(true)}
                className="px-3 py-1 text-sm font-medium bg-[#007200] text-white rounded hover:bg-[#70e000] hover:text-[#004b23] transition-colors"
              >
                Swap Meal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Swap Meal Modal */}
      {showSwapModal && (
        <SwapMealModal
          mealTitle={title}
          mealType={mealType}
          mealPlanContext={mealPlanContext}
          onClose={() => setShowSwapModal(false)}
          onMealSelected={handleMealSwapped}
        />
      )}
    </>
  );
}
