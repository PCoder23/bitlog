import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const DEMO_FOODS = [
  { id: "demo-1", name: "Chole", caloriesPer100g: 180, defaultServingG: 150 },
  {
    id: "demo-2",
    name: "Chole Chawal",
    caloriesPer100g: 165,
    defaultServingG: 300,
  },
  {
    id: "demo-3",
    name: "Chole Bhature",
    caloriesPer100g: 280,
    defaultServingG: 250,
  },
  {
    id: "demo-4",
    name: "Grilled Chicken",
    caloriesPer100g: 165,
    defaultServingG: 120,
  },
  {
    id: "demo-5",
    name: "Paneer Tikka",
    caloriesPer100g: 240,
    defaultServingG: 120,
  },
];

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
  const items =
    q.length === 0
      ? []
      : DEMO_FOODS.filter((f) =>
          f.name.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 20);
  return NextResponse.json({ items });
}
