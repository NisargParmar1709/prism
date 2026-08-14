'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ArrowRightLeft, Wallet, PieChart, Settings, LogOut } from 'lucide-react';
import { useProfile } from '@/hooks/use-settings';
import { signOut } from '@/lib/auth';
import toast from 'react-hot-toast';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: profile } = useProfile();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-[240px] bg-prism-white border-r border-prism-border flex flex-col hidden md:flex z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-prism-border">
        <h1 className="text-h2 font-bold gradient-text tracking-tight">Prism</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2.5 rounded-lg text-body font-medium transition-colors ${
                isActive
                  ? 'bg-prism-violet-50 text-prism-violet-700'
                  : 'text-prism-text-secondary hover:bg-prism-surface hover:text-prism-text'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-prism-violet-600' : 'text-prism-text-muted'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-prism-border space-y-4">
        {profile && (
          <div className="flex items-center px-2">
            <div className="w-8 h-8 rounded-full bg-prism-violet-100 flex items-center justify-center shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-prism-violet-700">
                  {profile.full_name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-small font-medium text-prism-text truncate">
                {profile.full_name || 'User'}
              </p>
              <p className="text-xs text-prism-text-muted truncate">
                {profile.email}
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2.5 rounded-lg text-body font-medium text-prism-text-secondary hover:bg-prism-surface hover:text-prism-text transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3 text-prism-text-muted" />
          Log out
        </button>
      </div>
    </aside>
  );
}
