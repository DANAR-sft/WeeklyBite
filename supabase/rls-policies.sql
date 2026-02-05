-- =============================================
-- RLS POLICIES SETUP untuk Weekly Meal Planner
-- =============================================
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- untuk menyelesaikan masalah 500 error dan constraint violations
-- =============================================

-- 1. Ubah meal_id di grocery_lists menjadi NULLABLE
--    Karena ada grocery items yang tidak terkait dengan meal spesifik
ALTER TABLE public.grocery_lists 
ALTER COLUMN meal_id DROP NOT NULL;

-- =============================================
-- 2. RLS POLICIES untuk meal_plans
-- =============================================
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika ada (ignore error jika tidak ada)
DROP POLICY IF EXISTS "Users can view own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can create own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can update own meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Users can delete own meal plans" ON public.meal_plans;

-- Policy: Users dapat melihat meal plan mereka sendiri
CREATE POLICY "Users can view own meal plans"
    ON public.meal_plans FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users dapat membuat meal plan untuk diri sendiri
CREATE POLICY "Users can create own meal plans"
    ON public.meal_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users dapat update meal plan mereka sendiri
CREATE POLICY "Users can update own meal plans"
    ON public.meal_plans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users dapat delete meal plan mereka sendiri
CREATE POLICY "Users can delete own meal plans"
    ON public.meal_plans FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- 3. RLS POLICIES untuk meals
-- =============================================
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika ada
DROP POLICY IF EXISTS "Users can view own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can create meals for own plans" ON public.meals;
DROP POLICY IF EXISTS "Users can update own meals" ON public.meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON public.meals;

-- Policy: Users dapat melihat meals dari meal plan mereka
CREATE POLICY "Users can view own meals"
    ON public.meals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policy: Users dapat membuat meals untuk meal plan mereka
CREATE POLICY "Users can create meals for own plans"
    ON public.meals FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policy: Users dapat update meals mereka
CREATE POLICY "Users can update own meals"
    ON public.meals FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policy: Users dapat delete meals mereka
CREATE POLICY "Users can delete own meals"
    ON public.meals FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = meals.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- =============================================
-- 4. RLS POLICIES untuk grocery_lists
-- =============================================
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika ada
DROP POLICY IF EXISTS "Users can view own groceries" ON public.grocery_lists;
DROP POLICY IF EXISTS "Users can create groceries for own plans" ON public.grocery_lists;
DROP POLICY IF EXISTS "Users can update own groceries" ON public.grocery_lists;
DROP POLICY IF EXISTS "Users can delete own groceries" ON public.grocery_lists;

-- Policy: Users dapat melihat grocery dari meal plan mereka
CREATE POLICY "Users can view own groceries"
    ON public.grocery_lists FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = grocery_lists.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policy: Users dapat membuat grocery untuk meal plan mereka
CREATE POLICY "Users can create groceries for own plans"
    ON public.grocery_lists FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = grocery_lists.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policy: Users dapat update grocery mereka
CREATE POLICY "Users can update own groceries"
    ON public.grocery_lists FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = grocery_lists.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- Policy: Users dapat delete grocery mereka
CREATE POLICY "Users can delete own groceries"
    ON public.grocery_lists FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.meal_plans
            WHERE meal_plans.id = grocery_lists.meal_plan_id
            AND meal_plans.user_id = auth.uid()
        )
    );

-- =============================================
-- 5. RLS POLICIES untuk user_profiles
-- =============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika ada
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

-- Policy: Users dapat melihat profile mereka sendiri
CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users dapat membuat profile untuk diri sendiri
CREATE POLICY "Users can create own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users dapat update profile mereka sendiri
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users dapat delete profile mereka sendiri
CREATE POLICY "Users can delete own profile"
    ON public.user_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- SELESAI! 
-- =============================================
-- Setelah menjalankan SQL ini:
-- 1. Refresh halaman aplikasi Anda
-- 2. Coba generate meal plan baru
-- 3. Cek apakah data tersimpan ke database
-- 4. Verifikasi tidak ada error 500 atau constraint violations
-- =============================================
