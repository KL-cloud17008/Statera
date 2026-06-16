import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { MobileNav } from "@/components/layout/MobileNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-atmosphere min-h-screen text-foreground">
      <DesktopSidebar />
      <MobileHeader />

      <main className="relative pb-32 md:pb-16">
        <div className="mx-auto flex min-h-screen w-full max-w-[104rem] flex-col px-5 py-7 sm:px-6 md:px-8 lg:px-10">
          {children}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
