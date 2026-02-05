import { NextResponse } from "next/server";
import { prepService } from "../../../services/prep-service";
import { createClient } from "@/lib/supabase/server";

/**
 * GET - Ambil meal prep context terakhir user
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

    const data = await prepService.getMealPrepContext(user.id);

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

/**
 * POST - Simpan/update meal prep context
 */
export async function POST(req: Request) {
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

    const data = await prepService.saveMealPrepContext(user.id, {
      dietary_goals: body.dietary_goals,
      diet_type: body.diet_type,
      calories_target: body.calories_target,
      allergies: body.allergies || [],
      cuisine_preferences: body.cuisine_preferences || [],
      dislikes: body.dislikes || [],
    });

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}

/**
 * DELETE - Hapus meal prep context
 */
export async function DELETE() {
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

    await prepService.deleteMealPrepContext(user.id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
