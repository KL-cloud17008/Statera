import type { Metadata } from "next";
import { WeightImportClient } from "@/components/weight/WeightImportClient";

export const metadata: Metadata = {
  title: "Import Weight Data | Athanor",
  description: "Preview and import historical weight CSV data.",
};

export default function WeightImportPage() {
  return <WeightImportClient />;
}
