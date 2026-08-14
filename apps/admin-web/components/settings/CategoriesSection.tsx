'use client';

import React, { useState } from 'react';
import { Settings, Plus, Lock, Pencil, Trash2 } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PrismButton } from '@/components/ui/PrismButton';
import { useCategories, useDeleteCategory, Category } from '@/hooks/use-categories';
import { CategoryModal } from '@/components/categories/CategoryModal';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(undefined);

  const expenses = categories?.filter(c => c.type === 'expense') || [];
  const incomes = categories?.filter(c => c.type === 'income') || [];

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (category.is_default) return; // Should not happen due to UI, but safe check
    
    if (confirm(`Are you sure you want to delete the "${category.name}" category? Transactions using this category may be affected.`)) {
      try {
        await deleteCategory.mutateAsync(category.id);
      } catch (e) {
        // Handled by toast in hook
      }
    }
  };

  const renderCategoryList = (list: Category[], title: string) => (
    <div className="mb-8 last:mb-0">
      <h3 className="text-small font-semibold text-prism-text-muted uppercase tracking-wider mb-4 px-2">
        {title} ({list.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {list.map(cat => (
          <div key={cat.id} className="flex items-center justify-between p-3 rounded-card border border-prism-border bg-prism-white hover:border-prism-violet-200 transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: cat.color + '20', color: cat.color }} // 20 hex is 12% opacity
              >
                {cat.icon}
              </div>
              <div className="truncate">
                <p className="text-small font-medium text-prism-text truncate">{cat.name}</p>
                {cat.is_default && (
                  <p className="text-xs text-prism-text-muted flex items-center gap-1">
                    <Lock className="w-3 h-3" /> System Default
                  </p>
                )}
              </div>
            </div>
            
            {!cat.is_default && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 text-prism-text-muted hover:text-prism-violet-600 rounded bg-prism-surface hover:bg-prism-violet-50 transition-colors"
                  title="Edit category"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-prism-text-muted hover:text-prism-danger rounded bg-prism-surface hover:bg-red-50 transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionHeader 
          title="Categories" 
          subtitle="Manage your custom income and expense categories." 
          icon={<Settings className="w-5 h-5 text-prism-violet-600" />}
        />
        <PrismButton onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </PrismButton>
      </div>

      <div className="bg-prism-surface rounded-card p-4 sm:p-6 shadow-sm">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-16 w-full rounded-card" />)}
            </div>
          </div>
        ) : categories && categories.length > 0 ? (
          <>
            {renderCategoryList(expenses, 'Expense Categories')}
            {renderCategoryList(incomes, 'Income Categories')}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-prism-text-muted">No categories found.</p>
          </div>
        )}
      </div>

      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
}
