import { DashboardLayout } from '../components/layout/dashboard-layout';
import { ISACOSThemeEngine } from '../components/themes/ISACOSThemeEngine';

export default function ThemeEngine() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">ISAC-OS Theme Engine</h1>
            <p className="text-muted-foreground">
              Advanced tactical interface customization and visual effects control
            </p>
          </div>
          <ISACOSThemeEngine />
        </div>
      </div>
    </DashboardLayout>
  );
}