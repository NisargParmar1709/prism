'use client';

import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { useExportData } from '../../hooks/use-settings';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

export function DataPrivacySection() {
  const { mutate: exportData, isPending } = useExportData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-h3 font-semibold text-slate-900 mb-6 uppercase tracking-wider text-xs">Data & Privacy</h3>
        
        <div className="space-y-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-1">Export your data</h4>
              <p className="text-xs text-slate-500">Download a complete CSV export of all your transactions and account history.</p>
            </div>
            <button
              onClick={() => exportData()}
              disabled={isPending}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isPending ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-1">Delete Account</h4>
              <p className="text-xs text-slate-500">Permanently remove your personal data, accounts, and all transactions from Prism.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeleteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
