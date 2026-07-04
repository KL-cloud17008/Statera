"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { getTodayDateString, parseDate } from "@/lib/dates";

type PainActionResult = {
  error?: string;
};

export type SerializedPainCheckIn = {
  date: string;
  footPain: number;
  lowerBackPain: number | null;
};

function parsePainValue(raw: FormDataEntryValue | null) {
  if (raw == null || raw === "") {
    return undefined;
  }

  const value = Number.parseInt(String(raw), 10);
  if (Number.isNaN(value) || value < 0 || value > 10) {
    return null;
  }

  return value;
}

export async function logPainCheckIn(formData: FormData): Promise<PainActionResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const footPain = parsePainValue(formData.get("footPain"));
  if (footPain == null) {
    return { error: "Foot pain must be a number from 0 to 10" };
  }

  const lowerBackPain = parsePainValue(formData.get("lowerBackPain"));
  if (lowerBackPain === null) {
    return { error: "Lower-back pain must be a number from 0 to 10" };
  }

  // Stored per local calendar day (same convention as steps).
  const date = parseDate(getTodayDateString(user.timezone));

  await prisma.painCheckIn.upsert({
    where: { userId_date: { userId: user.id, date } },
    // An omitted secondary value leaves any previously logged value in place.
    update: { footPain, ...(lowerBackPain !== undefined ? { lowerBackPain } : {}) },
    create: {
      userId: user.id,
      date,
      footPain,
      lowerBackPain: lowerBackPain ?? null,
    },
  });

  revalidatePath("/");
  revalidatePath("/mobility");
  return {};
}

export async function getLatestPainCheckIn(
  userId: string
): Promise<SerializedPainCheckIn | null> {
  const latest = await prisma.painCheckIn.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  if (!latest) {
    return null;
  }

  return {
    date: latest.date.toISOString().split("T")[0],
    footPain: latest.footPain,
    lowerBackPain: latest.lowerBackPain,
  };
}
