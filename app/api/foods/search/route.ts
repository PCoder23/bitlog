import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const all = searchParams.get("all") === "1";
  const supabase = getSupabaseServerClient();

  if (!supabase) return NextResponse.json({ items: [] });

  let query = supabase
    .from("foods")
    .select(
      "id,name,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,default_serving_g"
    )
    .order("name", { ascending: true });

  if (q.length > 0) {
    query = query.ilike("name", `%${q}%`).limit(20);
  } else if (all) {
    query = query.limit(100);
  } else {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message, items: [] },
      { status: 400 }
    );
  }

  const items = (data || []).map((r: any) => ({
    id: r.id as string,
    name: r.name as string,
    caloriesPer100g:
      r.calories_per_100g != null ? Number(r.calories_per_100g) : undefined,
    proteinPer100g:
      r.protein_per_100g != null ? Number(r.protein_per_100g) : undefined,
    carbsPer100g:
      r.carbs_per_100g != null ? Number(r.carbs_per_100g) : undefined,
    fatPer100g: r.fat_per_100g != null ? Number(r.fat_per_100g) : undefined,
    defaultServingG:
      r.default_serving_g != null ? Number(r.default_serving_g) : undefined,
  }));

  return NextResponse.json({ items });
}
