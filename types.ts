// in @/types
export type Food = {
  id: string;
  name: string;
  caloriesPer100g?: number;
  proteinPer100g?: number;
  carbsPer100g?: number;
  fatPer100g?: number;
  defaultServingG?: number;
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
