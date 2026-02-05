"use client";

import { useState } from "react";
import Image from "next/image";
import { GroceryItem, MealPlanData } from "../../types/definitions";
import {
  Apple,
  Milk,
  Leaf,
  Croissant,
  ShoppingCart,
  Check,
  Zap,
  Package,
  Sprout,
  Beef,
  Wheat,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

// Category icons mapping
const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();

  if (
    categoryLower.includes("fruit") ||
    categoryLower.includes("vegetable") ||
    categoryLower.includes("apple") ||
    categoryLower.includes("banana") ||
    categoryLower.includes("orange") ||
    categoryLower.includes("strawberry")
  ) {
    return <Apple className="w-6 h-6" />;
  }

  if (categoryLower.includes("dairy") || categoryLower.includes("milk")) {
    return <Milk className="w-6 h-6" />;
  }

  if (
    categoryLower.includes("veg") ||
    categoryLower.includes("vegetable") ||
    categoryLower.includes("green")
  ) {
    return <Leaf className="w-6 h-6" />;
  }

  if (
    categoryLower.includes("bake") ||
    categoryLower.includes("bread") ||
    categoryLower.includes("grain")
  ) {
    return <Wheat className="w-6 h-6" />;
  }

  if (categoryLower.includes("protein")) {
    return <Beef className="w-6 h-6" />;
  }

  if (categoryLower.includes("pantry")) {
    return <Package className="w-6 h-6" />;
  }

  if (categoryLower.includes("produce")) {
    return <Sprout className="w-6 h-6" />;
  }

  return <ShoppingCart className="w-6 h-6" />;
};

// Get background color based on category
const getCategoryColor = (category: string) => {
  const categoryLower = category.toLowerCase();

  if (
    categoryLower.includes("fruit") ||
    categoryLower.includes("apple") ||
    categoryLower.includes("banana") ||
    categoryLower.includes("orange") ||
    categoryLower.includes("strawberry")
  ) {
    return "bg-orange-50 border-orange-200 text-orange-700";
  }

  if (categoryLower.includes("dairy") || categoryLower.includes("milk")) {
    return "bg-blue-50 border-blue-200 text-blue-700";
  }

  if (
    categoryLower.includes("veg") ||
    categoryLower.includes("vegetable") ||
    categoryLower.includes("green")
  ) {
    return "bg-green-50 border-green-200 text-green-700";
  }

  if (
    categoryLower.includes("bake") ||
    categoryLower.includes("bread") ||
    categoryLower.includes("grain")
  ) {
    return "bg-amber-50 border-amber-200 text-amber-700";
  }

  return "bg-gray-50 border-gray-200 text-gray-700";
};

interface GroceryListProps {
  data: MealPlanData;
  onToggleBought: (itemId: string, isBought: boolean) => void | Promise<void>;
}

export default function GroceryList({
  data,
  onToggleBought,
}: GroceryListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const handleToggle = async (itemId: string, isBought: boolean) => {
    setLoadingItems((prev) => new Set(prev).add(itemId));
    try {
      await onToggleBought(itemId, isBought);
    } finally {
      setLoadingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const groupedGroceries =
    data.grocery_list?.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, GroceryItem[]>,
    ) || {};

  const categories = Object.keys(groupedGroceries);
  const displayCategories = selectedCategory ? [selectedCategory] : categories;

  const totalPrice =
    data.grocery_list?.reduce(
      (sum, item) => sum + (item.estimated_price ?? item.price ?? 0),
      0,
    ) || 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h3 className="text-sm md:text-lg font-semibold text-gray-700 mb-4">
            Categories
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {/* All button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 transition-all ${
                selectedCategory === null
                  ? "border-[#007200] bg-[#f0f9f0]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <ShoppingCart
                className={`w-4 h-4 sm:w-6 sm:h-6 mb-1 sm:mb-2 ${
                  selectedCategory === null ? "text-[#007200]" : "text-gray-600"
                }`}
              />
              <span
                className={`text-[10px] sm:text-sm font-medium ${
                  selectedCategory === null ? "text-[#007200]" : "text-gray-700"
                }`}
              >
                All
              </span>
            </button>

            {/* Category buttons */}
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex flex-col items-center justify-center p-2 sm:p-4 rounded-xl border-2 transition-all ${
                  selectedCategory === category
                    ? "border-[#007200] bg-[#f0f9f0]"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div
                  className={`mb-1 sm:mb-2 text-4 sm:text-6 ${
                    selectedCategory === category
                      ? "text-[#007200]"
                      : "text-gray-600"
                  }`}
                >
                  {getCategoryIcon(category)}
                </div>
                <span
                  className={`text-[10px] sm:text-sm font-medium line-clamp-1 ${
                    selectedCategory === category
                      ? "text-[#007200]"
                      : "text-gray-700"
                  }`}
                >
                  {category}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="space-y-6">
        {displayCategories.map((category) => {
          const items = groupedGroceries[category] || [];
          return (
            <div
              key={category}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#004b23] mb-4 flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                {category}
              </h3>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                  const price = item.estimated_price ?? item.price ?? 0;
                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl border-2 p-4 transition-all ${
                        item.is_bought
                          ? "border-gray-200 bg-gray-50"
                          : "border-gray-200 bg-white hover:shadow-md hover:border-[#007200]"
                      }`}
                    >
                      {/* Product Image */}
                      <div className="flex items-center justify-center w-full h-32 sm:h-40 rounded-lg bg-gray-100 mb-3 overflow-hidden relative">
                        <Image
                          src={getProductImage(item.ingredient_name)}
                          alt={item.ingredient_name}
                          fill
                          className="w-10 h-10 object-contain"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="space-y-2 mb-4">
                        <h4
                          className={`font-bold text-sm sm:text-base line-clamp-2 ${
                            item.is_bought
                              ? "text-gray-400 line-through"
                              : "text-[#004b23]"
                          }`}
                        >
                          {item.ingredient_name}
                        </h4>

                        {item.quantity && (
                          <p className="text-xs sm:text-sm text-gray-600">
                            {item.quantity}
                          </p>
                        )}

                        {item.notes && (
                          <p className="text-xs text-gray-500 italic">
                            {item.notes}
                          </p>
                        )}
                      </div>

                      {/* Price */}
                      <div className="mb-4 pt-3 border-t border-gray-200">
                        <p
                          className={`text-base sm:text-lg font-bold ${
                            item.is_bought ? "text-gray-400" : "text-[#007200]"
                          }`}
                        >
                          Rp
                          {price.toLocaleString("id-ID", {
                            minimumFractionDigits: 0,
                          })}
                        </p>
                      </div>

                      {/* Add to Cart / Bought Button */}
                      <button
                        onClick={() => handleToggle(item.id, !item.is_bought)}
                        disabled={loadingItems.has(item.id)}
                        className={`w-full py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          item.is_bought
                            ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                            : "bg-[#007200] text-white hover:bg-[#70e000] hover:text-[#004b23]"
                        }`}
                      >
                        {loadingItems.has(item.id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-current border-t-transparent" />
                        ) : item.is_bought ? (
                          <>
                            <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                            Bought
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grand Total */}
      <Card className="bg-linear-to-r from-[#007200] to-[#005a00] border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-white">
              <p className="text-sm opacity-90">
                Estimated Total Shopping Cost
              </p>
              <p className="text-xs opacity-75 mt-1">
                {data.grocery_list?.length || 0} items
              </p>
            </div>
            <div className="text-white text-right">
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Rp{totalPrice.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to get image for product based on ingredient type
function getProductImage(productName: string): string {
  const name = productName.toLowerCase();

  // Plants: fruits, vegetables, grains, seeds
  const plantKeywords = [
    "fruit",
    "apple",
    "banana",
    "orange",
    "strawberry",
    "blueberry",
    "grape",
    "mango",
    "pineapple",
    "watermelon",
    "peach",
    "pear",
    "kiwi",
    "vegetable",
    "carrot",
    "broccoli",
    "spinach",
    "lettuce",
    "tomato",
    "cucumber",
    "bell",
    "pepper",
    "onion",
    "garlic",
    "potato",
    "sweet",
    "corn",
    "pumpkin",
    "cabbage",
    "rice",
    "wheat",
    "grain",
    "seed",
    "bean",
    "lentil",
    "peanut",
    "nut",
    "almond",
    "walnut",
    "oat",
    "flour",
    "cereal",
  ];

  // Meat/Protein
  const meatKeywords = [
    "chicken",
    "beef",
    "pork",
    "fish",
    "salmon",
    "egg",
    "meat",
    "protein",
    "steak",
    "ribs",
    "lamb",
    "turkey",
  ];

  // Bread/Bakery
  const breadKeywords = [
    "bread",
    "bakery",
    "croissant",
    "donut",
    "cake",
    "cookie",
    "pasta",
    "noodle",
    "toast",
    "baguette",
    "roll",
  ];

  // Check meat first (beef.svg)
  for (const keyword of meatKeywords) {
    if (name.includes(keyword)) {
      return "/beef.png";
    }
  }

  // Check bread second (basketbread.svg)
  for (const keyword of breadKeywords) {
    if (name.includes(keyword)) {
      return "/basketbread.png";
    }
  }

  // Default to vegetables (vegetables.svg)
  return "/vegetables.png";
}
