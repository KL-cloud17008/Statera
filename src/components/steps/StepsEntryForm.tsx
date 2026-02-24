"use client";

import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logSteps } from "@/actions/steps";

export function StepsEntryForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    const result = await logSteps(formData);
    setIsPending(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Steps logged!");
      formRef.current?.reset();
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Log Steps</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={today}
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="steps">Steps</Label>
            <Input
              id="steps"
              name="steps"
              type="number"
              min="0"
              max="200000"
              placeholder="e.g. 8500"
              required
            />
          </div>
          <Button type="submit" disabled={isPending} className="sm:w-auto">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Log"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
