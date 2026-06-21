import { Apple, Database, Gauge, Utensils } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";

const NUTRITION_MODULES = [
  {
    title: "Daily log",
    description: "Daily calorie and macro logging is active on the main nutrition page.",
    icon: Utensils,
  },
  {
    title: "Macro rhythm",
    description: "Targets and weekly averages are reserved for the nutrition summary workspace.",
    icon: Gauge,
  },
  {
    title: "Saved library",
    description: "Foods and meal templates will stay separate from the training and bodyweight ledger.",
    icon: Database,
  },
];

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
        <div className="command-panel grid gap-6 rounded-[var(--radius-panel)] p-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
          <EmptyState
            icon={Apple}
            title="Supporting nutrition workspace"
            description="Daily logging is connected to persistence. This supporting area is reserved for the next saved-foods, meal-template, and import pass."
            className="border-t-0 py-0"
          />
          <div className="rounded-[var(--radius-card)] border border-white/10 bg-white/7 p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/48">Status</p>
            <p className="mt-2 text-2xl font-semibold text-primary-foreground">Staged support</p>
            <p className="mt-2 text-sm leading-relaxed text-white/58">
              Use the daily nutrition log for persisted entries and targets.
            </p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          {NUTRITION_MODULES.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="surface-inset rounded-[var(--radius-card)] p-4">
                <div className="flex items-start gap-3">
                  <div className="duna-mark-surface flex h-10 w-10 items-center justify-center rounded-[var(--radius-tight)] text-foreground/82">
                    <Icon className="h-[1.125rem] w-[1.125rem]" />
                  </div>
                  <div>
                    <p className="eyebrow text-[10px]">{item.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
