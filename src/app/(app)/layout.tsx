import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <DesktopSidebar />
      <MobileHeader />

      <main className="pb-32 md:pb-8 md:pl-[18rem]">
        <div className="mx-auto flex min-h-screen max-w-[78rem] flex-col px-4 py-4 sm:px-5 md:px-8 md:py-8">
          <div className="page-shell">{children}</div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
