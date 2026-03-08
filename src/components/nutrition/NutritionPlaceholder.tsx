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
        title="Nutrition tools are queued next"
        description="The redesign pass keeps these routes aligned with the new system while the nutrition workflows remain in the backlog."
      />
    </div>
  );
}
