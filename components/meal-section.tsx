"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

export function MealSection({ meal, onAdd, entries }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | undefined>(undefined);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (
        showDropdown &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showDropdown]);

  // SWR key: if dropdown is open and q empty => fetch all; if q typed => search; else null
  const swrKey = showDropdown
    ? q.trim().length > 0
      ? `/api/foods/search?q=${encodeURIComponent(q.trim())}`
      : `/api/foods/search?all=1`
    : null;

  const { data } = useSWR(swrKey, fetcher);
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
    const f: Food | undefined = data.food;
    if (f) {
      setSelectedFood(f);
      setOpen(true);
      setShowDropdown(false);
    }
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
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }) {
    // Fallback compute if modal didn’t return macros/calories
    const calc = (per100?: number) =>
      typeof per100 === "number"
        ? +(per100 * (grams / 100)).toFixed(1)
        : undefined;

    const finalCalories =
      typeof calories === "number" ? calories : calc(food.caloriesPer100g);

    const finalProtein =
      typeof protein === "number" ? protein : calc(food.proteinPer100g);
    const finalCarbs =
      typeof carbs === "number" ? carbs : calc(food.carbsPer100g);
    const finalFat = typeof fat === "number" ? fat : calc(food.fatPer100g);

    onAdd({
      id: uuidv4(),
      dateKey: new Date().toISOString().slice(0, 10),
      meal,
      foodId: food.id,
      name: food.name,
      grams,
      calories: finalCalories ?? 0,
      protein: finalProtein,
      carbs: finalCarbs,
      fat: finalFat,
    });
  }

  return (
    <Card className="rounded-2xl shadow-sm border bg-background">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-pretty">
          {sectionTitle}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3" ref={wrapperRef}>
        {/* Search with icon */}
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            placeholder="Search food"
            value={q}
            onFocus={() => setShowDropdown(true)}
            onChange={(e) => {
              setQ(e.target.value);
              if (!showDropdown) setShowDropdown(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (q.trim().length > 0 || selectedFood)) {
                e.preventDefault();
                ensureAndOpen(q.trim());
              }
            }}
            className="h-10 pl-9"
            aria-label="Search food"
          />
        </div>

        {/* Results dropdown */}
        {showDropdown && (
          <div className="flex flex-col gap-2">
            {hasResults ? (
              <ul className="max-h-72 overflow-auto divide-y rounded-xl border">
                {items.slice(0, 20).map((f) => (
                  <li
                    key={f.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer"
                    onClick={() => ensureAndOpen(f.name)}
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {f.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {typeof f.caloriesPer100g === "number"
                          ? `${f.caloriesPer100g} kcal`
                          : "–"}{" "}
                        / 100g
                        {typeof f.proteinPer100g === "number" && (
                          <> • P {f.proteinPer100g}g</>
                        )}
                        {typeof f.carbsPer100g === "number" && (
                          <> • C {f.carbsPer100g}g</>
                        )}
                        {typeof f.fatPer100g === "number" && (
                          <> • F {f.fatPer100g}g</>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={(e) => {
                        e.stopPropagation();
                        ensureAndOpen(f.name);
                      }}
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

        {/* Existing entries */}
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
            No items yet. Click the input to browse or start typing to search.
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
