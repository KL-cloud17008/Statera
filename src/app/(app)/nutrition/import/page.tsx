import type { Metadata } from "next";
import { NutritionPlaceholder } from "@/components/nutrition/NutritionPlaceholder";

export const metadata: Metadata = {
  title: "Import Nutrition Data | Athanor",
  description: "Import historical nutrition data from supported CSV exports.",
};

export default function NutritionImportPage() {
  return (
    <NutritionPlaceholder
      eyebrow="Nutrition"
      title="Import nutrition history"
      description="Bring in past calorie and macro data from external CSV exports."
    />
  );
}
