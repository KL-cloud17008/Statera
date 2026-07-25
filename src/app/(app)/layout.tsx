import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <DesktopSidebar />
      <MobileHeader />

      {/* Bottom padding clears the fixed mobile tab bar plus its safe-area inset,
          so no tap target is ever overlapped by the nav. */}
      <main className="app-container pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pt-10 md:pb-16">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
