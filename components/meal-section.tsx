"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import type { Entry, Food, MealKey } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FoodModal from "@/components/food-modal";

type Props = {
  meal: MealKey;
  onAdd: (e: Entry) => void;
  entries: Entry[];
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function MealSection({
  meal,
  onAdd,
  entries,
}: {
  meal: MealKey;
  onAdd: (e: Entry) => void;
  entries: Entry[];
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | undefined>(undefined);

  const { data } = useSWR(
    q.trim().length > 0
      ? `/api/foods/search?q=${encodeURIComponent(q.trim())}`
      : null,
    fetcher
  );
  const items: Food[] = data?.items ?? [];

  const hasResults = items.length > 0;
  const sectionTitle = useMemo(() => {
    switch (meal) {
      case "morning":
        return "Morning Snack";
      case "lunch":
        return "Lunch";
      case "evening":
        return "Evening Snack";
      case "dinner":
        return "Dinner";
    }
  }, [meal]);

  async function ensureAndOpen(name: string) {
    const res = await fetch("/api/foods/ensure", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    const f: Food = data.food;
    setSelectedFood(f);
    setOpen(true);
  }

  function handleConfirm({
    food,
    grams,
    calories,
    protein,
    carbs,
    fat,
  }: {
    food: Food;
    grams: number;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }) {
    onAdd({
      id: uuidv4(),
      dateKey: new Date().toISOString().slice(0, 10),
      meal,
      foodId: food.id,
      name: food.name,
      grams,
      calories,
      protein,
      carbs,
      fat,
    });
  }

  return (
    <Card className="rounded-2xl shadow-sm border bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-pretty">
          {sectionTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search food"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim().length > 0) {
                e.preventDefault();
                ensureAndOpen(q.trim());
              }
            }}
            className="h-10"
            aria-label="Search food"
          />
        </div>

        {q && (
          <div className="flex flex-col gap-2">
            {hasResults ? (
              <ul className="divide-y rounded-lg border">
                {items.slice(0, 10).map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {f.name}
                      </div>
                      {typeof f.caloriesPer100g === "number" && (
                        <div className="text-xs text-muted-foreground">
                          {f.caloriesPer100g} kcal / 100g
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => ensureAndOpen(f.name)}
                      className="shrink-0"
                      aria-label={`Add ${f.name}`}
                    >
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <button
                type="button"
                className="flex items-center justify-between rounded-lg border p-3 text-left hover:bg-muted/50"
                onClick={() => ensureAndOpen(q.trim())}
                aria-label={`Use ${q}`}
              >
                <div className="text-sm">
                  Use “{q}”
                  <div className="text-xs text-muted-foreground">
                    Press Enter to add
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Add</span>
              </button>
            )}
          </div>
        )}

        {entries.length > 0 && (
          <ul className="mt-1 space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div>
                  <div className="text-sm font-medium">{e.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.grams}g • {e.calories} kcal
                    {(e.protein || e.carbs || e.fat) && (
                      <>
                        {" "}
                        • P:{e.protein ?? 0}g C:{e.carbs ?? 0}g F:{e.fat ?? 0}g
                      </>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                  onClick={() => {
                    const event = new CustomEvent("remove-entry", {
                      detail: e.id,
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {selectedFood && (
        <FoodModal
          open={open}
          onOpenChange={setOpen}
          food={selectedFood}
          onConfirm={handleConfirm}
        />
      )}
    </Card>
  );
}
