'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { PrismButton } from '@/components/ui/PrismButton';
import { PrismInput } from '@/components/ui/PrismInput';
import { useCreateCategory, useUpdateCategory, Category } from '@/hooks/use-categories';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category; // If provided, we are in edit mode
  onSuccess?: (categoryId: string) => void;
}

const PRESET_COLORS = [
  '#F87171', // red
  '#FB923C', // orange
  '#FBBF24', // amber
  '#34D399', // emerald
  '#60A5FA', // blue
  '#818CF8', // indigo
  '#A78BFA', // violet
  '#F472B6', // pink
  '#94A3B8', // slate
];

const formSchema = z.object({
  type: z.enum(['expense', 'income']),
  name: z.string().min(1, 'Name is required').max(50, 'Name is too long'),
  icon: z.string().min(1, 'Icon is required').max(10, 'Icon is too long'),
  color: z.string().min(1, 'Color is required'),
});

type FormValues = z.infer<typeof formSchema>;

export function CategoryModal({ isOpen, onClose, category, onSuccess }: CategoryModalProps) {
  const isEdit = !!category;
  
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      name: '',
      icon: '✨',
      color: PRESET_COLORS[0],
    },
  });

  // Reset form when opened or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        form.reset({
          type: category.type,
          name: category.name,
          icon: category.icon,
          color: category.color,
        });
      } else {
        form.reset({
          type: 'expense',
          name: '',
          icon: '✨',
          color: PRESET_COLORS[0],
        });
      }
    }
  }, [isOpen, category, form]);

  const selectedType = form.watch('type');
  const selectedColor = form.watch('color');

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          data: values,
        });
        if (onSuccess) onSuccess(category.id);
      } else {
        const newCat = await createCategory.mutateAsync(values);
        if (onSuccess) onSuccess(newCat.id);
      }
      onClose();
    } catch (error) {
      // Error handled by toast in hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-4 sm:p-0">
      <div 
        className="fixed inset-0 bg-prism-text/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-prism-white rounded-t-3xl md:rounded-card w-full max-w-[400px] shadow-card animate-in slide-in-from-bottom-full md:slide-in-from-bottom-0 md:zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-prism-border sticky top-0 bg-prism-white z-10">
          <h2 className="text-h3 font-semibold text-prism-text">
            {isEdit ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-prism-text-muted hover:text-prism-text transition-colors rounded-full hover:bg-prism-surface"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-prism-5">
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* Type Toggle */}
            <div className="flex bg-prism-surface p-1 rounded-input">
              <button
                type="button"
                disabled={isEdit} // Do not allow changing type in edit mode for safety
                onClick={() => form.setValue('type', 'expense')}
                className={`flex-1 py-2 text-small font-medium rounded-md transition-colors ${
                  selectedType === 'expense' 
                    ? 'bg-prism-white text-prism-danger shadow-sm' 
                    : 'text-prism-text-muted hover:text-prism-text'
                } ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Expense
              </button>
              <button
                type="button"
                disabled={isEdit}
                onClick={() => form.setValue('type', 'income')}
                className={`flex-1 py-2 text-small font-medium rounded-md transition-colors ${
                  selectedType === 'income' 
                    ? 'bg-prism-white text-prism-success shadow-sm' 
                    : 'text-prism-text-muted hover:text-prism-text'
                } ${isEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Income
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-small text-prism-text mb-1">Name</label>
              <PrismInput 
                {...form.register('name')}
                placeholder="e.g. Pet Supplies"
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="text-xs text-prism-danger mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Icon */}
            <div>
              <label className="block text-small text-prism-text mb-1">Icon (Emoji)</label>
              <PrismInput 
                {...form.register('icon')}
                placeholder="🐕"
              />
              {form.formState.errors.icon && (
                <p className="text-xs text-prism-danger mt-1">{form.formState.errors.icon.message}</p>
              )}
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-small text-prism-text mb-2">Color</label>
              <div className="flex flex-wrap gap-3">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => form.setValue('color', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      selectedColor === color ? 'border-prism-text scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {form.formState.errors.color && (
                <p className="text-xs text-prism-danger mt-1">{form.formState.errors.color.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2">
              <PrismButton 
                variant="primary" 
                className="w-full"
                type="submit"
                isLoading={createCategory.isPending || updateCategory.isPending}
              >
                Save Category
              </PrismButton>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
