'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useBalanceVisibility } from '../providers/BalanceProvider';

export function BalanceToggle() {
  const { showBalance, toggleBalance } = useBalanceVisibility();

  return (
    <button
      onClick={toggleBalance}
      className="p-2 text-[var(--prism-text-muted)] hover:text-[var(--prism-text)] hover:bg-[var(--prism-elevated)] rounded-full transition-colors"
      aria-label={showBalance ? "Hide balances" : "Show balances"}
    >
      {showBalance ? <Eye size={24} /> : <EyeOff size={24} />}
    </button>
  );
}
