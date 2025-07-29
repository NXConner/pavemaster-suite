import { Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';
import ThemeCustomizer from './ThemeCustomizer';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  const { wallpaper } = useTheme();
  const isAuthPage = location.pathname === '/auth';

  // Don't show layout on auth page
  if (isAuthPage) {
    return (
      <div className={cn(
        "min-h-screen",
        wallpaper && "has-wallpaper"
      )}>
        {wallpaper && <div className="wallpaper-overlay fixed inset-0 z-0" />}
        <div className="relative z-10">
          <Outlet />
        </div>
        <ThemeCustomizer />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex",
      wallpaper && "has-wallpaper"
    )}>
      {wallpaper && <div className="wallpaper-overlay fixed inset-0 z-0" />}
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <ThemeCustomizer />
    </div>
  );
}