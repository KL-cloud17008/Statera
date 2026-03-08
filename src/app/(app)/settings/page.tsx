import type { Metadata } from "next";
import { getOrCreateCurrentUser } from "@/lib/current-user";
import { SettingsPageClient } from "@/components/settings/SettingsPageClient";

export const metadata: Metadata = {
  title: "Settings | ATHANOR",
  description: "Manage profile values, units, theme, backups, imports, and data safety controls.",
};

export default async function SettingsPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return null;
  }

  return (
    <SettingsPageClient
      profile={{
        heightInches: user.heightInches,
        startWeight: user.startWeight,
        goalWeight: user.goalWeight,
        timezone: user.timezone,
      }}
    />
  );
}
