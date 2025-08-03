import { AppSidebar } from './app-sidebar';
import { ISACTacticalHUD } from '../isac/ISACTacticalHUD';
import { ISACStatusBar } from '../isac/ISACStatusBar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto py-6 px-4 pb-20">
          {children}
        </div>
      </main>
      <ISACTacticalHUD />
      <ISACStatusBar />
    </div>
  );
}