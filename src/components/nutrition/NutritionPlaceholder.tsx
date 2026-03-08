import { Apple } from "lucide-react";
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
      <SectionHeader eyebrow={eyebrow} title={title} description={description}>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="rounded-full bg-white/8 px-3 py-1.5">Premium placeholder</span>
          <span className="rounded-full bg-white/8 px-3 py-1.5">Nutrition workflows pending</span>
        </div>
      </SectionHeader>

      <section className="editorial-panel px-6 py-6 sm:px-7 sm:py-7">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <Apple className="h-6 w-6" />
            </div>
            <div>
              <p className="eyebrow">Queued Next</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Nutrition tools are aligned, but still in backlog
              </h2>
              <p className="mt-3 supporting-copy">
                The route now matches the redesigned system while the meal logging and macro workflows remain intentionally deferred.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <PlaceholderNote
              title="Visual system is ready"
              description="Typography, spacing, and empty-state treatment now match the rest of the product."
            />
            <PlaceholderNote
              title="Feature work can drop in later"
              description="The page is structured so real nutrition tools can replace these notes without another redesign pass."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function PlaceholderNote({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[1.3rem] border border-border/80 bg-background/35 px-4 py-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
