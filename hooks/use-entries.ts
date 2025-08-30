"use client";

import { useState, useMemo } from "react";
import type { Entry, MealKey } from "@/types";

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);

  const add = (entry: Entry) => setEntries((prev) => [...prev, entry]);
  const remove = (id: string) =>
    setEntries((prev) => prev.filter((e) => e.id !== id));

  const byMeal: Record<MealKey, Entry[]> = useMemo(() => {
    return {
      morning: entries.filter((e) => e.meal === "morning"),
      lunch: entries.filter((e) => e.meal === "lunch"),
      evening: entries.filter((e) => e.meal === "evening"),
      dinner: entries.filter((e) => e.meal === "dinner"),
    };
  }, [entries]);

  // ✅ totals (all meals combined)
  const totals = useMemo(() => {
    return entries.reduce(
      (acc, e) => {
        acc.calories += e.calories ?? 0;
        acc.protein += e.protein ?? 0;
        acc.carbs += e.carbs ?? 0;
        acc.fat += e.fat ?? 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [entries]);

  return { byMeal, add, remove, totals };
}
