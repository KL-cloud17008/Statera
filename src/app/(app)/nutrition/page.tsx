import type { Metadata } from "next";
import { NutritionPlaceholder } from "@/components/nutrition/NutritionPlaceholder";

export const metadata: Metadata = {
  title: "Nutrition | Athnaor",
  description: "Log daily meals, track macros, and review nutrition trends.",
};

export default function NutritionPage() {
  return (
    <NutritionPlaceholder
      eyebrow="Nutrition"
      title="Daily nutrition log"
      description="Log meals, watch macro targets, and compare intake against weekly averages."
    />
  );
}
