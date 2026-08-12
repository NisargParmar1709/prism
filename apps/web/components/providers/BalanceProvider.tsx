'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BalanceContextType {
  showBalance: boolean;
  toggleBalance: () => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('prism_show_balance');
    if (stored !== null) {
      setShowBalance(stored === 'true');
    }
  }, []);

  const toggleBalance = () => {
    setShowBalance((prev) => {
      const newValue = !prev;
      localStorage.setItem('prism_show_balance', String(newValue));
      return newValue;
    });
  };

  // Prevent hydration mismatch by rendering children without context initially
  // Actually, we can render context, but the value will be the default initially.
  // It's usually better to just provide the default true and let it update on client mount.

  return (
    <BalanceContext.Provider value={{ showBalance, toggleBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalanceVisibility() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalanceVisibility must be used within a BalanceProvider');
  }
  return context;
}
