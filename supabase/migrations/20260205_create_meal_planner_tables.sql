-- ============================================
-- Migration: Create tables for meal planner
-- ============================================

-- 1. Tabel meal_prep_contexts (menyimpan preferensi user)
CREATE TABLE IF NOT EXISTS public.meal_prep_contexts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dietary_goals TEXT NOT NULL,
    diet_type TEXT NOT NULL DEFAULT 'Standard',
    calories_target INTEGER NOT NULL DEFAULT 2000,
    allergies TEXT[] DEFAULT '{}',
    cuisine_preferences TEXT[] DEFAULT '{}',
    dislikes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Tabel meal_plans (header meal plan mingguan)
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_weekly_calories INTEGER DEFAULT 0,
    total_weekly_protein INTEGER DEFAULT 0,
    total_weekly_carbs INTEGER DEFAULT 0,
    total_weekly_fat INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel meals (detail meal per hari)
CREATE TABLE IF NOT EXISTS public.meals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    recipe_name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    calories INTEGER DEFAULT 0,
    protein INTEGER DEFAULT 0,
    carbs INTEGER DEFAULT 0,
    fat INTEGER DEFAULT 0,
    is_swapped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel grocery_lists (daftar belanja)
CREATE TABLE IF NOT EXISTS public.grocery_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
    meal_id UUID REFERENCES public.meals(id) ON DELETE SET NULL,
    ingredient_name TEXT NOT NULL,
    quantity TEXT,
    category TEXT DEFAULT 'Other',
    estimated_price NUMERIC(10,2) DEFAULT 0,
    is_bought BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel user_profiles (profil user tambahan)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dietary_goals TEXT,
    diet_type TEXT,
    calories_target INTEGER,
    allergies TEXT[] DEFAULT '{}',
    cuisine_preferences TEXT[] DEFAULT '{}',
    dislikes TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- Indexes untuk performa query
-- ============================================

CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON public.meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_meal_plan_id ON public.meals(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_meals_day ON public.meals(day);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_meal_plan_id ON public.grocery_lists(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_category ON public.grocery_lists(category);
CREATE INDEX IF NOT EXISTS idx_meal_prep_contexts_user_id ON public.meal_prep_contexts(user_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.meal_prep_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies untuk meal_prep_contexts
CREATE POLICY "Users can view own meal prep contexts"
    ON public.meal_prep_contexts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal prep contexts"
    ON public.meal_prep_contexts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal prep contexts"
    ON public.meal_prep_contexts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal prep contexts"
    ON public.meal_prep_contexts FOR DELETE
    USING (auth.uid() = user_id);

-- Policies untuk meal_plans
CREATE POLICY "Users can view own meal plans"
    ON public.meal_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
    ON public.meal_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
    ON public.meal_plans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
    ON public.meal_plans FOR DELETE
    USING (auth.uid() = user_id);

-- Policies untuk meals (via meal_plan ownership)
CREATE POLICY "Users can view meals from own plans"
    ON public.meals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert meals to own plans"
    ON public.meals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update meals in own plans"
    ON public.meals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete meals from own plans"
    ON public.meals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policies untuk grocery_lists (via meal_plan ownership)
CREATE POLICY "Users can view groceries from own plans"
    ON public.grocery_lists FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = grocery_lists.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert groceries to own plans"
    ON public.grocery_lists FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update groceries in own plans"
    ON public.grocery_lists FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = grocery_lists.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete groceries from own plans"
    ON public.grocery_lists FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = grocery_lists.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policies untuk user_profiles
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
    ON public.user_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- Trigger untuk auto-update updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_meal_prep_contexts
    BEFORE UPDATE ON public.meal_prep_contexts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_meal_plans
    BEFORE UPDATE ON public.meal_plans
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_meals
    BEFORE UPDATE ON public.meals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_grocery_lists
    BEFORE UPDATE ON public.grocery_lists
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
