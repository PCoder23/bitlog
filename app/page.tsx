"use client";
import { MealSection } from "@/components/meal-section";
import { useEntries } from "@/hooks/use-entries";

export default function Page() {
  return (
    <main className="mx-auto max-w-lg p-4 pb-24">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-pretty">BiteLog</h1>
        <p className="text-sm text-muted-foreground">
          Track your day by meals. Search anything and add quickly.
        </p>
      </header>
      {/* Client wrapper */}
      <ClientTracker />
    </main>
  );
}
import { useEffect } from "react";

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

  return (
    <>
      <div className="grid gap-4">
        <MealSection meal="morning" onAdd={onAdd} entries={byMeal.morning} />
        <MealSection meal="lunch" onAdd={onAdd} entries={byMeal.lunch} />
        <MealSection meal="evening" onAdd={onAdd} entries={byMeal.evening} />
        <MealSection meal="dinner" onAdd={onAdd} entries={byMeal.dinner} />
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-lg p-4 space-y-1">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Total Today</div>
            <div className="text-xl font-semibold">{totals.calories} kcal</div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Protein: {totals.protein} g</span>
            <span>Carbs: {totals.carbs} g</span>
            <span>Fat: {totals.fat} g</span>
          </div>
        </div>
      </footer>
    </>
  );
}
