import React from 'react';
import { ProfileSection } from '../../../components/settings/ProfileSection';
import { NotificationsSection } from '../../../components/settings/NotificationsSection';
import { DataPrivacySection } from '../../../components/settings/DataPrivacySection';
import { CategoriesSection } from '../../../components/settings/CategoriesSection';
import { Settings as SettingsIcon, Bell, Shield, Tags } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-8">
      {/* Sidebar Navigation for Desktop, sticky on scroll */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="sticky top-8 space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 px-3">Settings</h1>
          
          <a href="#profile" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg">
            <SettingsIcon className="w-4 h-4" />
            Profile
          </a>
          <a href="#notifications" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
            Notifications
          </a>
          <a href="#privacy" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
            <Shield className="w-4 h-4" />
            Data & Privacy
          </a>
          <a href="#categories" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors">
            <Tags className="w-4 h-4" />
            Categories
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        <section id="profile" className="scroll-mt-8">
          <ProfileSection />
        </section>
        
        <section id="notifications" className="scroll-mt-8">
          <NotificationsSection />
        </section>
        
        <section id="privacy" className="scroll-mt-8">
          <DataPrivacySection />
        </section>
        
        <section id="categories" className="scroll-mt-8">
          <CategoriesSection />
        </section>
      </div>
    </div>
  );
}
