"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import type { Entry, Food, MealKey } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FoodModal from "@/components/food-modal";
import { Search, Plus } from "lucide-react";

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
        {/* Search with icon */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
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
            className="h-10 pl-9"
            aria-label="Search food"
          />
        </div>

        {q && (
          <div className="flex flex-col gap-2">
            {hasResults ? (
              <ul className="divide-y rounded-xl border">
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
                      variant="default"
                      onClick={() => ensureAndOpen(f.name)}
                      className="shrink-0"
                      aria-label={`Add ${f.name}`}
                    >
                      <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Add
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <button
                type="button"
                className="flex items-center justify-between rounded-xl border p-3 text-left hover:bg-muted/50"
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

        {entries.length > 0 ? (
          <ul className="mt-1 space-y-2">
            {entries.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-xl border p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{e.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {e.grams}g • {e.calories} kcal
                    </span>
                    {(e.protein || e.carbs || e.fat) && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {typeof e.protein === "number" && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                            P {e.protein}g
                          </span>
                        )}
                        {typeof e.carbs === "number" && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-accent">
                            C {e.carbs}g
                          </span>
                        )}
                        {typeof e.fat === "number" && (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                            F {e.fat}g
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-accent hover:bg-accent/10"
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
        ) : (
          <div className="rounded-xl border p-3 text-center text-sm text-muted-foreground">
            No items yet. Search above to add your first one.
          </div>
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
