"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Food } from "@/types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  food: Food;
  onConfirm: (result: {
    food: Food;
    grams: number;
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }) => void;
};

export default function FoodModal({
  open,
  onOpenChange,
  food,
  onConfirm,
}: Props) {
  const [quantity, setQuantity] = React.useState(1);
  const [grams, setGrams] = React.useState<number>(food.defaultServingG ?? 100);
  const [manual, setManual] = React.useState(false);

  const calPer100 = food.caloriesPer100g ?? 0;
  const totalGrams = grams * quantity;

  const computed = React.useMemo(
    () => Math.round((calPer100 * totalGrams) / 100),
    [calPer100, totalGrams]
  );

  const [manualCal, setManualCal] = React.useState<number>(computed);

  React.useEffect(() => {
    if (!manual) setManualCal(computed);
  }, [computed, manual]);

  function handleSave() {
    onConfirm({
      food,
      grams: totalGrams,
      calories: manual ? manualCal : computed,
      protein: food.proteinPer100g
        ? Math.round((food.proteinPer100g * totalGrams) / 100)
        : undefined,
      carbs: food.carbsPer100g
        ? Math.round((food.carbsPer100g * totalGrams) / 100)
        : undefined,
      fat: food.fatPer100g
        ? Math.round((food.fatPer100g * totalGrams) / 100)
        : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Food</DialogTitle>
          <DialogDescription>
            Choose quantity & weight and confirm calories/macros.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Name</Label>
            <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
              {food.name}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Calories per 100g</Label>
            <Input value={calPer100} disabled />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="grams">Weight (grams)</Label>
              <Input
                id="grams"
                type="number"
                inputMode="decimal"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="manual">Adjust calories manually</Label>
              <input
                id="manual"
                type="checkbox"
                className="h-4 w-4"
                checked={manual}
                onChange={(e) => setManual(e.target.checked)}
              />
            </div>
            <Input
              type="number"
              inputMode="decimal"
              value={manual ? manualCal : computed}
              onChange={(e) => setManualCal(Number(e.target.value))}
              disabled={!manual}
            />
            {!manual && (
              <p className="text-xs text-muted-foreground">
                Calculated: {computed} kcal ({totalGrams} g total)
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
