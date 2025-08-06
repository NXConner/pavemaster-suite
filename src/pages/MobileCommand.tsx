import { MobileCommandCenter } from '../components/mobile/MobileCommandCenter';
import { MobileNavigation } from '../components/mobile/MobileNavigation';
import { PWAInstallPrompt } from '../components/mobile/PWAInstallPrompt';

export default function MobileCommand() {
  return (
    <div className="min-h-screen bg-card">
      <MobileNavigation />
      <MobileCommandCenter />
      <PWAInstallPrompt />
    </div>
  );
}