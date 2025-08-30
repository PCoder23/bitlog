import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const supabase = getSupabaseServerClient();

  if (supabase && q.length > 0) {
    const { data, error } = await supabase
      .from("foods")
      .select("id,name,calories_per_100g,default_serving_g")
      .ilike("name", `%${q}%`)
      .limit(20);

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
        typeof r.calories_per_100g === "number"
          ? r.calories_per_100g
          : Number(r.calories_per_100g),
      defaultServingG:
        r.default_serving_g != null
          ? typeof r.default_serving_g === "number"
            ? r.default_serving_g
            : Number(r.default_serving_g)
          : undefined,
    }));
    return NextResponse.json({ items });
  }

  // Demo fallback
  return NextResponse.json({ items: [] });
}
