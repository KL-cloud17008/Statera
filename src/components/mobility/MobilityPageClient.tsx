"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logMobility } from "@/actions/mobility";
import { MobilityChecklist } from "./MobilityChecklist";
import { getPostWorkoutChecklist, getPreWorkoutChecklist, UNDO_SITTING } from "@/lib/mobility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DAY_NAMES: Record<number, string> = {
  1: "Day 1 - Upper A",
  2: "Day 2 - Lower A",
  3: "Day 3 - Upper B",
  4: "Day 4 - Lower B",
  5: "Day 5 - Full-Body",
};

export function MobilityPageClient({
  dayOfWeek,
  isTrainingDay,
  completedTypes,
}: {
  dayOfWeek: number;
  isTrainingDay: boolean;
  completedTypes: string[];
}) {
  const router = useRouter();
  const [version, setVersion] = useState<"A" | "B">("A");
  const [isPending, startTransition] = useTransition();

  const preBlocks = isTrainingDay ? getPreWorkoutChecklist(dayOfWeek, version) : [];
  const postBlocks = isTrainingDay ? getPostWorkoutChecklist(dayOfWeek) : [];
  const undoBlocks = [UNDO_SITTING];

  const preCompleted = completedTypes.includes("PRE_WORKOUT");
  const postCompleted = completedTypes.includes("POST_WORKOUT");
  const undoCount = completedTypes.filter((type) => type === "UNDO_SITTING").length;

  function handleLogCompletion(type: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("type", type);
      formData.set("version", version);
      const result = await logMobility(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(
        type === "PRE_WORKOUT"
          ? "Pre-workout logged"
          : type === "POST_WORKOUT"
            ? "Post-workout logged"
            : "Undo-sitting logged"
      );
      router.refresh();
    });
  }

  return (
    <div className="page-shell">
      <SectionHeader
        eyebrow="Mobility"
        title={isTrainingDay ? DAY_NAMES[dayOfWeek] ?? "Training Day" : "Recovery and movement prep"}
        description={isTrainingDay ? "Move through your warm-up and cooldown flows, then log each routine once it’s complete." : "Rest day mode keeps the undo-sitting flow close by so you can break up long periods at the desk."}
      >
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {preCompleted ? <Badge variant="default">Pre done</Badge> : null}
          {postCompleted ? <Badge variant="secondary">Post done</Badge> : null}
          {undoCount > 0 ? <Badge variant="outline">Undo sitting {undoCount}x</Badge> : null}
        </div>
      </SectionHeader>

      <Tabs defaultValue={isTrainingDay ? "pre" : "undo"}>
        <TabsList className="w-full justify-start sm:w-fit">
          {isTrainingDay ? <TabsTrigger value="pre">Pre-Workout</TabsTrigger> : null}
          {isTrainingDay ? <TabsTrigger value="post">Post-Workout</TabsTrigger> : null}
          <TabsTrigger value="undo">Undo Sitting</TabsTrigger>
        </TabsList>

        {isTrainingDay ? (
          <TabsContent value="pre" className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-[--radius-card] border border-border bg-muted/30 p-4">
              <span className="text-sm text-muted-foreground">Version</span>
              <Button type="button" variant={version === "A" ? "default" : "outline"} size="sm" onClick={() => setVersion("A")}>A - Normal</Button>
              <Button type="button" variant={version === "B" ? "default" : "outline"} size="sm" onClick={() => setVersion("B")}>B - Sore/Stiff</Button>
            </div>
            {preCompleted ? (
              <Card>
                <CardContent className="space-y-3 py-10 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                  <p className="text-lg font-semibold text-foreground">Pre-workout completed today</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <MobilityChecklist blocks={preBlocks} title="Pre-Workout Mobility" />
                <Button className="w-full gap-2" type="button" onClick={() => handleLogCompletion("PRE_WORKOUT")} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Mark Pre-Workout Complete
                </Button>
              </>
            )}
          </TabsContent>
        ) : null}

        {isTrainingDay ? (
          <TabsContent value="post" className="space-y-4">
            {postCompleted ? (
              <Card>
                <CardContent className="space-y-3 py-10 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
                  <p className="text-lg font-semibold text-foreground">Post-workout completed today</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <MobilityChecklist blocks={postBlocks} title="Post-Workout Cooldown" />
                <Button className="w-full gap-2" type="button" onClick={() => handleLogCompletion("POST_WORKOUT")} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Mark Post-Workout Complete
                </Button>
              </>
            )}
          </TabsContent>
        ) : null}

        <TabsContent value="undo" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[--radius-card] border border-border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Aim for 2-3 short sessions each day after long blocks of sitting.</p>
            {undoCount > 0 ? <Badge variant="outline">{undoCount} completed</Badge> : null}
          </div>
          <MobilityChecklist blocks={undoBlocks} title="Undo Sitting (3 min)" />
          <Button className="w-full gap-2" type="button" onClick={() => handleLogCompletion("UNDO_SITTING")} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Log Undo-Sitting Session
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
