import type { Metadata } from "next";
import { NutritionPlaceholder } from "@/components/nutrition/NutritionPlaceholder";

export const metadata: Metadata = {
  title: "Saved Meals | Athanor",
  description: "Build reusable meal templates from your saved foods.",
};

export default function MealsPage() {
  return (
    <NutritionPlaceholder
      eyebrow="Nutrition"
      title="Saved meals"
      description="Bundle common meal combinations into reusable templates for one-tap logging."
    />
  );
}
