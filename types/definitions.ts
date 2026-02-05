// types/index.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
}

export type CreatePostInput = Pick<Post, "title" | "content" | "user_id">;

export interface IAuthContextType {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  refreshAuth: () => Promise<void>;
  isUser: string;
  setIsUser: (value: string) => void;
  getUser: () => Promise<void>;
}

export type MealLocal = {
  recipe_name?: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image_url?: string;
};

export type DayPlan = {
  day: number;
  meals: {
    breakfast: MealLocal;
    lunch: MealLocal;
    dinner: MealLocal;
    snacks: MealLocal[];
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  recipe?: string;
};

export type GroceryItem = {
  id: string;
  ingredient_name: string;
  quantity?: string;
  category: string;
  estimated_price?: number;
  price?: number;
  notes?: string;
  meal_plan_id?: string;
  is_bought: boolean;
};

export type MealPlanData = {
  days: DayPlan[];
  grocery_list: GroceryItem[];
};

// ============================================
// Database Types (Supabase)
// ============================================

export type MealPrepDb = {
  id?: string;
  user_id?: string;
  dietary_goals: string;
  diet_type: string;
  calories_target: number;
  allergies: string[];
  cuisine_preferences: string[];
  dislikes: string[];
  updated_at?: string;
};

export type MealsDb = {
  id?: string;
  meal_plan_id: string;
  day: string;
  meal_type: string;
  recipe_name: string;
  description: string;
  image_url: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_swapped: boolean;
};

export type WeeklyMealPlanDb = {
  id?: string;
  user_id: string;
  start_date: string;
  total_weekly_calories: number;
  total_weekly_protein: number;
  total_weekly_carbs: number;
  total_weekly_fat: number;
};

export type GroceryListDb = {
  id?: string;
  meal_plan_id: string;
  meal_id?: string;
  ingredient_name: string;
  quantity: string;
  category: string;
  estimated_price: number;
  is_bought: boolean;
};

export interface UserProfile {
  id?: string;
  user_id: string;
  dietary_goals: string;
  diet_type: string;
  calories_target: number;
  allergies: string[];
  cuisine_preferences: string[];
  dislikes: string[];
}

export interface MealPlan {
  id?: string;
  user_id: string;
  start_date: string;
  total_weekly_calories: number;
  total_weekly_protein: number;
  total_weekly_carbs: number;
  total_weekly_fat: number;
}

export interface MealDb {
  id?: string;
  meal_plan_id: string;
  day: string;
  meal_type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  recipe_name: string;
  description: string;
  image_url: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_swapped: boolean;
}

export interface GroceryItemDb {
  id?: string;
  meal_plan_id: string;
  meal_id: string;
  ingredient_name: string;
  quantity: string;
  category: string;
  estimated_price: number;
  is_bought: boolean;
}
