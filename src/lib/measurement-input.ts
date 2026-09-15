import { getTodayDateString, isValidISODateString } from "@/lib/dates";

export function formText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** Reject partial numbers such as `8500steps`, `8.5` steps, or `270lb`. */
export function parseMeasurementNumber(value: string, integer = false) {
  const pattern = integer ? /^\d+$/ : /^(?:\d+(?:\.\d*)?|\.\d+)$/;
  if (!pattern.test(value.trim())) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** @db.Date values represent calendar dates, independent of the server timezone. */
export function measurementDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function validateMeasurementDate(value: string, timezone?: string) {
  if (!value) return "Date is required";
  if (!isValidISODateString(value)) return "Enter a valid date";
  if (value > getTodayDateString(timezone)) return "Choose today or a past date";
  return null;
}

export function parseWeightPayload(formData: FormData, timezone?: string) {
  const date = formText(formData, "date");
  const dateError = validateMeasurementDate(date, timezone);
  if (dateError) return { error: dateError } as const;

  const weight = parseMeasurementNumber(formText(formData, "weight"));
  if (weight == null || weight < 50 || weight > 999) {
    return { error: "Weight must be between 50 and 999 lb" } as const;
  }
  const status = formText(formData, "status") || "NORMAL";
  if (status !== "BASELINE" && status !== "FASTING" && status !== "NORMAL") {
    return { error: "Choose a valid weigh-in status" } as const;
  }

  const rawBodyFat = formText(formData, "bodyFatPercent");
  const bodyFatPercent = rawBodyFat ? parseMeasurementNumber(rawBodyFat) : null;
  if (rawBodyFat && (bodyFatPercent == null || bodyFatPercent < 1 || bodyFatPercent > 70)) {
    return { error: "Body fat must be between 1% and 70%" } as const;
  }
  const notes = formText(formData, "notes");
  if (notes.length > 2000) return { error: "Keep notes under 2,000 characters" } as const;

  return {
    data: {
      date: measurementDate(date),
      weight: Math.round(weight * 10) / 10,
      status,
      bodyFatPercent,
      notes: notes || null,
    },
  } as const;
}
