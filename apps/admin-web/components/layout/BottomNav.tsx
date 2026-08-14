'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowRightLeft, Plus, Wallet, Settings } from 'lucide-react';

interface BottomNavProps {
  onQuickAddClick: () => void;
}

const navItemsLeft = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
];

const navItemsRight = [
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function BottomNav({ onQuickAddClick }: BottomNavProps) {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const isActive = pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className="flex flex-col items-center justify-center w-full h-full space-y-1"
      >
        <Icon 
          className={`w-6 h-6 transition-colors ${
            isActive ? 'text-prism-violet-600' : 'text-prism-text-muted hover:text-prism-text-secondary'
          }`} 
        />
        <span className={`text-[10px] font-medium ${
          isActive ? 'text-prism-violet-700' : 'text-prism-text-muted'
        }`}>
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-prism-white border-t border-prism-border flex md:hidden z-40 pb-safe">
      <div className="flex-1 flex items-center justify-around">
        {navItemsLeft.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </div>

      <div className="relative flex items-center justify-center w-20">
        <button
          onClick={onQuickAddClick}
          className="absolute -top-6 flex items-center justify-center w-14 h-14 bg-prism-violet-600 rounded-full shadow-[0_4px_16px_rgba(124,58,237,0.35)] active:scale-95 transition-transform"
          aria-label="Quick Add"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-around">
        {navItemsRight.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </div>
    </nav>
  );
}
