import type { Metadata } from "next";
import { NutritionPlaceholder } from "@/components/nutrition/NutritionPlaceholder";

export const metadata: Metadata = {
  title: "Saved Foods | ATHANOR",
  description: "Manage a personal food database for faster nutrition logging.",
};

export default function FoodsPage() {
  return (
    <NutritionPlaceholder
      eyebrow="Nutrition"
      title="Saved foods"
      description="Create and manage frequently used foods for faster nutrition logging."
    />
  );
}
