import { MobileHeader } from "@/components/layout/MobileHeader";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { PresentationFrame } from "@/components/layout/PresentationFrame";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <DesktopSidebar />
      <MobileHeader />

      <main id="main-content" tabIndex={-1} className="md:pl-rail">
        <PresentationFrame>{children}</PresentationFrame>
      </main>
    </div>
  );
}
