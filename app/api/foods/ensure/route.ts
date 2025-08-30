import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

type DbFood = {
  id: string;
  name: string;
  calories_per_100g: number | null;
  protein_per_100g: number | null;
  carbs_per_100g: number | null;
  fat_per_100g: number | null;
  default_serving_g?: number | null;
};

// ✅ Zod schema for AI output
const nutritionSchema = z.object({
  calories_per_100g: z.number(),
  protein_per_100g: z.number().nullable(),
  carbs_per_100g: z.number().nullable(),
  fat_per_100g: z.number().nullable(),
});

function toCamel(r: DbFood) {
  return {
    id: r.id,
    name: r.name,
    caloriesPer100g:
      r.calories_per_100g != null ? Number(r.calories_per_100g) : undefined,
    defaultServingG:
      r.default_serving_g != null ? Number(r.default_serving_g) : undefined,
  };
}

export async function POST(req: Request) {
  const { name } = await req.json().catch(() => ({ name: "" }));
  const raw = (name || "").trim();
  if (!raw)
    return NextResponse.json({ error: "missing name" }, { status: 400 });

  const supabase = getSupabaseServerClient();

  // 1) Look up exact match (case-insensitive)
  if (supabase) {
    const { data: found, error } = await supabase
      .from("foods")
      .select(
        "id,name,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,default_serving_g"
      )
      .ilike("name", raw)
      .maybeSingle();

    if (!error && found) {
      return NextResponse.json({ food: toCamel(found as DbFood) });
    }
  }

  // 2) If missing, generate with AI + insert into DB
  if (supabase && process.env.OPENAI_API_KEY) {
    try {
      const { object: parsed } = await generateObject({
        // model: openai("gpt-4o"),
        // gpt 40 mini
        model: openai("gpt-4o-mini"),
        schema: nutritionSchema,
        system: `You are a nutrition expert. 
Return realistic nutrition values per 100g in **pure JSON** with keys:
{ calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g }`,
        prompt: `Food: ${raw}\nReturn only JSON.`,
      });
      console.log(JSON.stringify(parsed, null, 2));
      const payload = {
        name: raw,
        calories_per_100g: parsed.calories_per_100g || 180,
        protein_per_100g: parsed.protein_per_100g,
        carbs_per_100g: parsed.carbs_per_100g,
        fat_per_100g: parsed.fat_per_100g,
      };

      const { data: inserted, error: insErr } = await supabase
        .from("foods")
        .insert(payload)
        .select(
          "id,name,calories_per_100g,protein_per_100g,carbs_per_100g,fat_per_100g,default_serving_g"
        )
        .single();

      if (!insErr && inserted) {
        return NextResponse.json({ food: toCamel(inserted as DbFood) });
      }
    } catch (err) {
      console.error("AI generation failed:", err);
    }
  }

  // 3) Fallback if all else fails
  return NextResponse.json({});
}
