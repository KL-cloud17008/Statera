import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/db";
import { getTrainingDate, getTrainingDayNumber } from "@/lib/dates";
import { getTodayMobilityLogs } from "@/actions/mobility";
import { MobilityPageClient } from "@/components/mobility/MobilityPageClient";

export default async function MobilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  });
  if (!dbUser) return null;

  const now = new Date();
  const trainingDayNum = getTrainingDayNumber(now); // 1-5 or null (rest)
  const schemaDow = trainingDayNum ?? 6; // fallback for rest day
  const isTrainingDay = trainingDayNum !== null;

  const logs = await getTodayMobilityLogs(dbUser.id, dbUser.timezone);
  const completedTypes = logs.map((l) => l.type);

  return (
    <MobilityPageClient
      dayOfWeek={schemaDow}
      isTrainingDay={isTrainingDay}
      completedTypes={completedTypes}
    />
  );
}
