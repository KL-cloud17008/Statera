"use server";

import type { WeighInStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parseCSV, getHeaders, getDataRows } from "@/lib/csv";
import { parseCSVDate } from "@/lib/weight";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { parseDate } from "@/lib/dates";

type WeightMutationResult = {
  error?: string;
};

type WeightImportResult = {
  error?: string;
  imported: number;
  errors: string[];
};

type WeightExportResult = {
  error?: string;
  csv: string;
};

export async function getWeightEntries(userId: string) {
  return prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function addWeightEntry(
  formData: FormData
): Promise<WeightMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const dateStr = formData.get("date") as string;
  const weightStr = formData.get("weight") as string;
  const status = (formData.get("status") as string) || "NORMAL";
  const bodyFatStr = formData.get("bodyFatPercent") as string;
  const notes = (formData.get("notes") as string) || null;

  const weight = parseFloat(weightStr);
  if (Number.isNaN(weight) || weight < 50 || weight > 999) {
    return { error: "Weight must be between 50 and 999 lbs" };
  }

  if (!dateStr) {
    return { error: "Date is required" };
  }

  if (!["BASELINE", "FASTING", "NORMAL"].includes(status)) {
    return { error: "Invalid status" };
  }

  const bodyFatPercent = bodyFatStr ? parseFloat(bodyFatStr) : null;
  if (
    bodyFatPercent != null &&
    (Number.isNaN(bodyFatPercent) || bodyFatPercent < 1 || bodyFatPercent > 70)
  ) {
    return { error: "Body fat must be between 1% and 70%" };
  }

  await prisma.weightEntry.create({
    data: {
      userId: user.id,
      date: parseDate(dateStr),
      weight: Math.round(weight * 10) / 10,
      status: status as WeighInStatus,
      bodyFatPercent,
      notes: notes || null,
    },
  });

  revalidatePath("/weight");
  revalidatePath("/");
  return {};
}

export async function updateWeightEntry(
  formData: FormData
): Promise<WeightMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const id = formData.get("id") as string;
  const dateStr = formData.get("date") as string;
  const weightStr = formData.get("weight") as string;
  const status = (formData.get("status") as string) || "NORMAL";
  const bodyFatStr = formData.get("bodyFatPercent") as string;
  const notes = (formData.get("notes") as string) || null;

  if (!id) {
    return { error: "Entry ID is required" };
  }

  const weight = parseFloat(weightStr);
  if (Number.isNaN(weight) || weight < 50 || weight > 999) {
    return { error: "Weight must be between 50 and 999 lbs" };
  }

  if (!dateStr) {
    return { error: "Date is required" };
  }

  if (!["BASELINE", "FASTING", "NORMAL"].includes(status)) {
    return { error: "Invalid status" };
  }

  const bodyFatPercent = bodyFatStr ? parseFloat(bodyFatStr) : null;
  if (
    bodyFatPercent != null &&
    (Number.isNaN(bodyFatPercent) || bodyFatPercent < 1 || bodyFatPercent > 70)
  ) {
    return { error: "Body fat must be between 1% and 70%" };
  }

  const existing = await prisma.weightEntry.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return { error: "Entry not found" };
  }

  await prisma.weightEntry.update({
    where: { id },
    data: {
      date: parseDate(dateStr),
      weight: Math.round(weight * 10) / 10,
      status: status as WeighInStatus,
      bodyFatPercent,
      notes: notes || null,
    },
  });

  revalidatePath("/weight");
  revalidatePath("/");
  return {};
}

export async function deleteWeightEntry(
  formData: FormData
): Promise<WeightMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const id = formData.get("id") as string;
  if (!id) {
    return { error: "Entry ID is required" };
  }

  const existing = await prisma.weightEntry.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return { error: "Entry not found" };
  }

  await prisma.weightEntry.delete({ where: { id } });

  revalidatePath("/weight");
  revalidatePath("/");
  return {};
}

export async function importWeightCSV(
  formData: FormData
): Promise<WeightImportResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated", imported: 0, errors: [] };
  }

  const csvText = formData.get("csv") as string;
  if (!csvText) {
    return { error: "No CSV data", imported: 0, errors: [] };
  }

  const rows = parseCSV(csvText);
  const headers = getHeaders(rows);
  const dataRows = getDataRows(rows);

  const headerLower = headers.map((header) => header.toLowerCase());
  const statusCol = headerLower.findIndex((header) => header.includes("status"));
  const dateCol = headerLower.findIndex((header) => header.includes("date"));
  const weightCol = headerLower.findIndex((header) => header.includes("weight"));
  const bfCol = headerLower.findIndex((header) => header.includes("body fat"));

  if (dateCol === -1 || weightCol === -1) {
    return {
      error: "CSV must have Date and Weight columns",
      imported: 0,
      errors: [],
    };
  }

  const existingDates = new Set(
    (
      await prisma.weightEntry.findMany({
        where: { userId: user.id },
        select: { date: true },
      })
    ).map((entry) => entry.date.toISOString().split("T")[0])
  );

  const entries: {
    userId: string;
    date: Date;
    weight: number;
    status: WeighInStatus;
    bodyFatPercent: number | null;
  }[] = [];
  const errors: string[] = [];

  for (let index = 0; index < dataRows.length; index += 1) {
    const row = dataRows[index];
    const rowNum = index + 2;

    const rawDate = row[dateCol]?.trim();
    if (!rawDate) {
      errors.push(`Row ${rowNum}: Missing date`);
      continue;
    }

    const isoDate = parseCSVDate(rawDate);
    if (!isoDate) {
      errors.push(`Row ${rowNum}: Invalid date "${rawDate}"`);
      continue;
    }

    if (existingDates.has(isoDate)) {
      errors.push(`Row ${rowNum}: Duplicate date ${isoDate} skipped`);
      continue;
    }

    const rawWeight = row[weightCol]?.trim();
    const weight = parseFloat(rawWeight);
    if (Number.isNaN(weight) || weight <= 0) {
      errors.push(`Row ${rowNum}: Invalid weight "${rawWeight}"`);
      continue;
    }

    let status: WeighInStatus = "NORMAL";
    if (statusCol !== -1) {
      const rawStatus = row[statusCol]?.trim().toUpperCase();
      if (
        rawStatus === "BASELINE" ||
        rawStatus === "FASTING" ||
        rawStatus === "NORMAL"
      ) {
        status = rawStatus;
      }
    }

    let bodyFatPercent: number | null = null;
    if (bfCol !== -1) {
      const rawBf = row[bfCol]?.trim();
      if (rawBf) {
        const bf = parseFloat(rawBf);
        if (!Number.isNaN(bf) && bf > 0 && bf < 100) {
          bodyFatPercent = bf;
        }
      }
    }

    entries.push({
      userId: user.id,
      date: parseDate(isoDate),
      weight: Math.round(weight * 10) / 10,
      status,
      bodyFatPercent,
    });
    existingDates.add(isoDate);
  }

  if (entries.length === 0) {
    return { error: "No valid entries found", imported: 0, errors };
  }

  await prisma.weightEntry.createMany({ data: entries });

  revalidatePath("/weight");
  revalidatePath("/");
  return { imported: entries.length, errors };
}

export async function exportWeightCSV(): Promise<WeightExportResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated", csv: "" };
  }

  const entries = await prisma.weightEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  const header = "Status,Date,Weight (Scale),Body Fat % (Scale)";
  const rows = entries.map((entry) => {
    const date = entry.date;
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const statusLabel =
      entry.status === "BASELINE"
        ? "Baseline"
        : entry.status === "FASTING"
          ? "Fasting"
          : "Normal";
    const bf = entry.bodyFatPercent != null ? String(entry.bodyFatPercent) : "";
    return `${statusLabel},${dateStr},${entry.weight},${bf}`;
  });

  return { csv: [header, ...rows].join("\n") };
}
