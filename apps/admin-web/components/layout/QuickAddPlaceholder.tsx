'use client';

import { X } from 'lucide-react';
import { PrismButton } from '@/components/ui/PrismButton';

interface QuickAddPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddPlaceholder({ isOpen, onClose }: QuickAddPlaceholderProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-prism-text/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-prism-white rounded-card w-full max-w-md p-prism-5 shadow-card animate-in slide-in-from-bottom-4 md:slide-in-from-bottom-0 md:zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-prism-text-muted hover:text-prism-text-secondary transition-colors rounded-full hover:bg-prism-surface"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center space-y-4 pt-4 pb-2">
          <div className="mx-auto w-12 h-12 bg-prism-violet-50 rounded-full flex items-center justify-center">
            <span className="text-xl">✨</span>
          </div>
          <h2 className="text-h2 text-prism-text">Quick Add Coming Soon</h2>
          <p className="text-body text-prism-text-secondary">
            The Quick Add feature will be implemented in Week 2. You will be able to quickly add transactions from anywhere in the app.
          </p>
          <PrismButton variant="primary" onClick={onClose} className="w-full mt-4">
            Got it
          </PrismButton>
        </div>
      </div>
    </div>
  );
}
