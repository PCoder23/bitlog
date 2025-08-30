export type Food = {
  id: string;
  name: string;
  caloriesPer100g?: number | null;
  defaultServingG?: number | null;
  proteinPer100g?: number | null;
  carbsPer100g?: number | null;
  fatPer100g?: number | null;
};

export type MealKey = "morning" | "lunch" | "evening" | "dinner";
export type Entry = {
  id: string;
  dateKey: string;
  meal: MealKey;
  foodId: string;
  name: string;
  grams: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};
declare module "@/types" {}
