'use client';

import React, { useState } from 'react';
import { useDeleteAccount } from '../../hooks/use-settings';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfirmDeleteModal({ isOpen, onClose }: ConfirmDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  if (!isOpen) return null;

  const handleDelete = () => {
    if (confirmText === 'DELETE') {
      deleteAccount();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Delete your Prism account?</h2>
          <p className="text-slate-600 text-sm mb-6">
            This action cannot be undone. All your financial data, accounts, transactions, and savings goals will be permanently deleted.
          </p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type <strong>DELETE</strong> to confirm
            </label>
            <input 
              type="text" 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-danger/20 focus:border-danger outline-none transition-all"
              placeholder="DELETE"
            />
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 text-sm font-semibold hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDelete}
              disabled={confirmText !== 'DELETE' || isPending}
              className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
