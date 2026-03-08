"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MobilityChecklist } from "./MobilityChecklist";
import { logMobility } from "@/actions/mobility";
import { getPostWorkoutChecklist, getPreWorkoutChecklist, UNDO_SITTING } from "@/lib/mobility";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mobility</h1>
        <p className="text-muted-foreground">
          {isTrainingDay ? DAY_NAMES[dayOfWeek] ?? "Training Day" : "Rest Day - Undo-sitting routine only"}
        </p>
      </div>

      <Tabs defaultValue={isTrainingDay ? "pre" : "undo"}>
        <TabsList className="w-full">
          {isTrainingDay ? (
            <TabsTrigger value="pre" className="flex-1 gap-1">
              Pre-Workout
              {preCompleted ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : null}
            </TabsTrigger>
          ) : null}
          {isTrainingDay ? (
            <TabsTrigger value="post" className="flex-1 gap-1">
              Post-Workout
              {postCompleted ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : null}
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="undo" className="flex-1 gap-1">
            Undo Sitting
            {undoCount > 0 ? <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">{undoCount}x</Badge> : null}
          </TabsTrigger>
        </TabsList>

        {isTrainingDay ? (
          <TabsContent value="pre" className="mt-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Version:</span>
              <Button type="button" variant={version === "A" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setVersion("A")}>A - Normal</Button>
              <Button type="button" variant={version === "B" ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setVersion("B")}>B - Sore/Stiff</Button>
            </div>
            {preCompleted ? (
              <Card>
                <CardContent className="space-y-2 py-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
                  <p className="font-semibold text-foreground">Pre-workout completed today</p>
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
          <TabsContent value="post" className="mt-4 space-y-4">
            {postCompleted ? (
              <Card>
                <CardContent className="space-y-2 py-8 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-green-500" />
                  <p className="font-semibold text-foreground">Post-workout completed today</p>
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

        <TabsContent value="undo" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Aim for 2-3 sessions per day after long blocks of sitting.</p>
            {undoCount > 0 ? <Badge variant="secondary" className="text-xs">{undoCount} done today</Badge> : null}
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
