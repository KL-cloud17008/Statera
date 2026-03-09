import type { Metadata } from "next";
import { NutritionPlaceholder } from "@/components/nutrition/NutritionPlaceholder";

export const metadata: Metadata = {
  title: "Nutrition Summary | Athanor",
  description: "Review weekly and monthly calorie and macro averages.",
};

export default function NutritionSummaryPage() {
  return (
    <NutritionPlaceholder
      eyebrow="Nutrition"
      title="Nutrition summary"
      description="Review weekly and monthly averages across calories, protein, carbs, and fat."
    />
  );
}
