import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-foreground">
      <DesktopSidebar />
      <MobileHeader />

      <main className="relative pb-32 md:pb-14 md:pl-[16.25rem]">
        <div className="mx-auto flex min-h-screen max-w-[92rem] flex-col px-5 py-7 sm:px-6 md:px-12 md:py-12">
          <div className="page-shell">{children}</div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
