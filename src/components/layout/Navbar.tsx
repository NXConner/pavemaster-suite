import React from 'react';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="font-semibold text-lg">
            PaveMaster Suite
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </a>
          <a href="/projects" className="text-sm font-medium transition-colors hover:text-primary">
            Projects
          </a>
          <a href="/analytics" className="text-sm font-medium transition-colors hover:text-primary">
            Analytics
          </a>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Settings
          </Button>
        </div>
      </div>
    </nav>
  );
};