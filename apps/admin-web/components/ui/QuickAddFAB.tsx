import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export interface QuickAddFABProps {
  onClick: () => void;
  className?: string;
}

export const QuickAddFAB: React.FC<QuickAddFABProps> = ({ onClick, className = '' }) => {
  // Global "N" shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      if (!isInput && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClick]);

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className={`
        fixed bottom-6 right-6 z-50 flex items-center justify-center
        w-14 h-14 bg-prism-violet-600 rounded-full text-prism-white shadow-fab
        hover:bg-prism-violet-700 active:bg-prism-violet-900 focus:outline-none focus:ring-2 focus:ring-prism-violet-500 focus:ring-offset-2
        ${className}
      `}
      aria-label="Quick Add (Press N)"
    >
      <Plus className="w-6 h-6" />
    </motion.button>
  );
};

QuickAddFAB.displayName = 'QuickAddFAB';
