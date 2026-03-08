import { getOrCreateCurrentUser } from "@/lib/current-user";
import { SettingsPageClient } from "@/components/settings/SettingsPageClient";

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
