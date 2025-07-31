import { ReactNode } from 'react';
import { Header } from '@/components/Header';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  className?: string;
}

export function Layout({ 
  children, 
  title, 
  description, 
  showHeader = true, 
  className = "" 
}: LayoutProps) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {showHeader && <Header />}
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {title && (
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
        )}
        
        {children}
      </main>
      
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              © 2024 PaveMaster Suite. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;