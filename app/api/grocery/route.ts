import { NextRequest, NextResponse } from "next/server";
import { groceryService } from "../../../services/grocery-service";
import { createClient } from "@/lib/supabase/server";

/**
 * GET - Ambil grocery list berdasarkan meal_plan_id
 */
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const mealPlanId = searchParams.get("meal_plan_id");

    if (!mealPlanId) {
      return NextResponse.json(
        { ok: false, error: "meal_plan_id is required" },
        { status: 400 },
      );
    }

    const data = await groceryService.getGroceryList(mealPlanId);

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

/**
 * PATCH - Toggle is_bought status
 */
export async function PATCH(req: NextRequest) {
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

    const body = await req.json();
    const { grocery_id, current_status } = body;

    if (!grocery_id || current_status === undefined) {
      return NextResponse.json(
        { ok: false, error: "grocery_id and current_status are required" },
        { status: 400 },
      );
    }

    await groceryService.toggleBought(grocery_id, current_status);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Hapus grocery item
 */
export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const groceryId = searchParams.get("id");

    if (!groceryId) {
      return NextResponse.json(
        { ok: false, error: "id is required" },
        { status: 400 },
      );
    }

    await groceryService.deleteGroceryItem(groceryId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
