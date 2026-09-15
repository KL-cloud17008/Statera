"use server";

import type { WeighInStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { parseCSV, getHeaders, getDataRows } from "@/lib/csv";
import { parseCSVDate } from "@/lib/weight";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { formText, measurementDate, parseMeasurementNumber, parseWeightPayload, validateMeasurementDate } from "@/lib/measurement-input";

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
  const user = await getOrCreateCurrentUser();
  if (!user || user.id !== userId) return [];
  return prisma.weightEntry.findMany({
    where: { userId: user.id },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function addWeightEntry(
  formData: FormData
): Promise<WeightMutationResult> {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  const parsed = parseWeightPayload(formData, user.timezone);
  if ("error" in parsed) return { error: parsed.error };
  const requestId = formText(formData, "requestId");
  if (requestId && !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return { error: "Invalid save request. Reload the form and try again." };
  }

  if (requestId) {
    // The existing primary key supplies durable retry protection without a migration.
    // Scope it to the authenticated user so request IDs cannot cross data boundaries.
    const id = `weight:${user.id}:${requestId}`;
    const saved = await prisma.weightEntry.upsert({
      where: { id }, create: { id, userId: user.id, ...parsed.data }, update: {},
    }).catch(async (error: unknown) => {
      // Prisma can emulate an upsert with an empty update. If another request
      // wins its insert race, confirm the existing owned row instead of failing.
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        const existing = await prisma.weightEntry.findFirst({ where: { id, userId: user.id } });
        if (existing) return existing;
      }
      throw error;
    });
    if (saved.weight !== parsed.data.weight || saved.date.getTime() !== parsed.data.date.getTime() ||
      saved.status !== parsed.data.status || saved.bodyFatPercent !== parsed.data.bodyFatPercent ||
      saved.notes !== parsed.data.notes) {
      return { error: "This weigh-in was already saved with different details. Refresh and edit it in history." };
    }
  } else {
    await prisma.weightEntry.create({ data: { userId: user.id, ...parsed.data } });
  }

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

  const id = formText(formData, "id");

  if (!id) {
    return { error: "Entry ID is required" };
  }

  const parsed = parseWeightPayload(formData, user.timezone);
  if ("error" in parsed) return { error: parsed.error };
  const result = await prisma.weightEntry.updateMany({
    where: { id, userId: user.id }, data: parsed.data,
  });
  if (!result.count) {
    return { error: "Entry not found" };
  }

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

  const id = formText(formData, "id");
  if (!id) {
    return { error: "Entry ID is required" };
  }

  const deleted = await prisma.weightEntry.deleteMany({
    where: { id, userId: user.id },
  });
  if (!deleted.count) {
    return { error: "Entry not found" };
  }

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

  const csvText = formText(formData, "csv");
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
    if (!isoDate || validateMeasurementDate(isoDate, user.timezone)) {
      errors.push(`Row ${rowNum}: Invalid date "${rawDate}"`);
      continue;
    }

    if (existingDates.has(isoDate)) {
      errors.push(`Row ${rowNum}: Duplicate date ${isoDate} skipped`);
      continue;
    }

    const rawWeight = row[weightCol]?.trim();
    const weight = parseMeasurementNumber(rawWeight ?? "");
    if (weight == null || weight < 50 || weight > 999) {
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
        const bf = parseMeasurementNumber(rawBf);
        if (bf == null || bf < 1 || bf > 70) {
          errors.push(`Row ${rowNum}: Body fat must be between 1% and 70%`);
          continue;
        }
        bodyFatPercent = bf;
      }
    }

    entries.push({
      userId: user.id,
      date: measurementDate(isoDate),
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
    const dateStr = `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
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
