'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { QuickAddPlaceholder } from './QuickAddPlaceholder';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // In desktop, the FAB might be triggered via a keyboard shortcut (N key) or a fixed button.
  // We can add a desktop FAB later if required, but for now we'll handle the mobile FAB from BottomNav.

  return (
    <div className="min-h-screen bg-prism-surface flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[240px] pb-16 md:pb-0">
        <main className="min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />

      {/* Modals */}
      <QuickAddPlaceholder 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />
    </div>
  );
}
