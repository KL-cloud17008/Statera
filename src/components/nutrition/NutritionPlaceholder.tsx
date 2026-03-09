import { Apple } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

export function NutritionPlaceholder({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-shell">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <EmptyState
        icon={Apple}
        title="Coming soon"
        description="Nutrition tracking is on the roadmap. Meal logging, macro targets, and saved foods will appear here."
      />
    </div>
  );
}
