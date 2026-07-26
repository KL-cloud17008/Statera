import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <DesktopSidebar />
      <MobileHeader />

      {/* The canvas is offset by the rail on desktop; on mobile the bottom
          padding clears the tab bar and its safe-area inset. */}
      <main className="md:pl-rail">
        <div className="ledger py-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:py-10 md:pb-16">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
