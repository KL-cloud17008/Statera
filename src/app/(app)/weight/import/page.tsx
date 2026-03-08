import type { Metadata } from "next";
import { WeightImportClient } from "@/components/weight/WeightImportClient";

export const metadata: Metadata = {
  title: "Import Weight Data | ATHANOR",
  description: "Preview and import historical weight CSV data into your Fittrack timeline.",
};

export default function WeightImportPage() {
  return <WeightImportClient />;
}
