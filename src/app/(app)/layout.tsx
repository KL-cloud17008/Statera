import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { PresentationFrame } from "@/components/layout/PresentationFrame";
import { OfflineWorkoutAccount } from "@/components/workout/OfflineWorkout";
import { getCurrentAuthUser } from "@/lib/current-user";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getCurrentAuthUser();
  return (
    <div className="min-h-dvh bg-canvas">
      <OfflineWorkoutAccount accountId={authUser?.id ?? null} />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <DesktopSidebar />
      <MobileHeader />

      <main id="main-content" tabIndex={-1} className="md:pl-rail">
        <PresentationFrame>{children}</PresentationFrame>
      </main>
    </div>
  );
}
