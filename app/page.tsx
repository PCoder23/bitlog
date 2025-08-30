"use client";
import { MealSection } from "@/components/meal-section";
import { useEntries } from "@/hooks/use-entries";
import { Flame, Apple } from "lucide-react";

export default function Page() {
  return (
    <main className="mx-auto max-w-lg p-4 pb-28">
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background">
            <Apple className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="sr-only">BiteLog</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-pretty leading-tight">
              BiteLog
            </h1>
            <p className="text-sm text-muted-foreground">
              Track your day by meals. Search anything and add quickly.
            </p>
          </div>
        </div>
      </header>
      <ClientTracker />
    </main>
  );
}

import { useEffect, useMemo } from "react";

function ClientTracker() {
  const { byMeal, add, remove, totals } = useEntries();

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      remove(id);
    };
    window.addEventListener("remove-entry", handler as EventListener);
    return () =>
      window.removeEventListener("remove-entry", handler as EventListener);
  }, [remove]);

  const onAdd = (e: any) => add(e);

  // Compute macro calories for a simple visual breakdown
  const macroKcals = useMemo(() => {
    const p = (totals.protein ?? 0) * 4;
    const c = (totals.carbs ?? 0) * 4;
    const f = (totals.fat ?? 0) * 9;
    const total = Math.max(1, p + c + f); // avoid divide by 0
    return {
      p,
      c,
      f,
      pctP: Math.round((p / total) * 100),
      pctC: Math.round((c / total) * 100),
      pctF: Math.max(
        0,
        100 - Math.round((p / total) * 100) - Math.round((c / total) * 100)
      ),
    };
  }, [totals.protein, totals.carbs, totals.fat]);

  return (
    <>
      <div className="grid gap-4">
        <MealSection meal="morning" onAdd={onAdd} entries={byMeal.morning} />
        <MealSection meal="lunch" onAdd={onAdd} entries={byMeal.lunch} />
        <MealSection meal="evening" onAdd={onAdd} entries={byMeal.evening} />
        <MealSection meal="dinner" onAdd={onAdd} entries={byMeal.dinner} />
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Flame className="h-4 w-4 text-primary" aria-hidden="true" />
              <span>Total Today</span>
            </div>
            <div className="text-xl font-semibold">{totals.calories} kcal</div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              Protein: {totals.protein} g
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full bg-accent"
                aria-hidden="true"
              />
              Carbs: {totals.carbs} g
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="h-2 w-2 rounded-full bg-muted-foreground"
                aria-hidden="true"
              />
              Fat: {totals.fat} g
            </span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${macroKcals.pctP}%` }}
              aria-label={`Protein ${macroKcals.pctP}%`}
            />
            <div
              className="h-full bg-accent"
              style={{ width: `${macroKcals.pctC}%` }}
              aria-label={`Carbs ${macroKcals.pctC}%`}
            />
            <div
              className="h-full bg-muted-foreground"
              style={{ width: `${macroKcals.pctF}%` }}
              aria-label={`Fat ${macroKcals.pctF}%`}
            />
          </div>
        </div>
      </footer>
    </>
  );
}
