import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <DesktopSidebar />
      <MobileHeader />

      <main className="md:pl-rail">
        <div className="ledger page-enter py-6 pb-[calc(2.5rem+env(safe-area-inset-bottom))] md:py-10 md:pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
