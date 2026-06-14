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
      <section className="document-panel">
        <EmptyState
          icon={Apple}
          title="Coming soon"
          description="Nutrition tracking is on the roadmap. Meal logging, macro targets, and saved foods will appear here."
          className="border-t-0 py-0"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {["Daily log", "Macro rhythm", "Saved foods"].map((item) => (
            <div key={item} className="warm-row rounded-[var(--radius-card)] px-4 py-4">
              <p className="eyebrow text-[10px]">{item}</p>
              <p className="mt-2 text-sm text-muted-foreground">Queued for the nutrition workspace.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
