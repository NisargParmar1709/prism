'use client';

import React from 'react';
import { useNotificationPreferences, useUpdateNotificationPreferences, NotificationPreference } from '../../hooks/use-settings';

const alertLabels: Record<string, string> = {
  budget_80: 'Budget at 80%',
  budget_exceeded: 'Budget exceeded',
  low_balance: 'Low account balance',
  recurring_reminder: 'Recurring reminder',
  weekly_summary: 'Weekly summary',
  ai_insights: 'AI insights',
};

export function NotificationsSection() {
  const { data, isLoading } = useNotificationPreferences();
  const { mutate: updatePreferences } = useUpdateNotificationPreferences();

  const handleToggle = (alertType: string, field: 'email' | 'in_app', currentValue: boolean) => {
    if (!data) return;
    
    const newPreferences = data.preferences.map(pref => {
      if (pref.alert_type === alertType) {
        return { ...pref, [field]: !currentValue };
      }
      return pref;
    });
    
    updatePreferences({ preferences: newPreferences });
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl"></div>;
  }

  const preferences = data?.preferences || [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-h3 font-semibold text-slate-900 mb-6 uppercase tracking-wider text-xs">Notifications</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <th className="pb-3 font-medium">Alert Type</th>
              <th className="pb-3 font-medium text-center">Email</th>
              <th className="pb-3 font-medium text-center">In-App</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {preferences.map((pref) => (
              <tr key={pref.alert_type} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 text-sm text-slate-700 font-medium">
                  {alertLabels[pref.alert_type] || pref.alert_type}
                </td>
                <td className="py-4 text-center">
                  <Toggle 
                    checked={pref.email} 
                    onChange={() => handleToggle(pref.alert_type, 'email', pref.email)} 
                  />
                </td>
                <td className="py-4 text-center">
                  <Toggle 
                    checked={pref.in_app} 
                    onChange={() => handleToggle(pref.alert_type, 'in_app', pref.in_app)} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: () => void }) {
  return (
    <button 
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out ${checked ? 'bg-violet-600' : 'bg-slate-200'}`}
    >
      <span className="sr-only">Use setting</span>
      <span aria-hidden="true" className={`pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );
}
