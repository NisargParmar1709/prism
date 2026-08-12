import { useFormContext, useWatch } from 'react-hook-form';
import { OnboardingData } from '../../hooks/use-onboarding';
import { ArrowLeft, Loader2, Info } from 'lucide-react';

interface StepExpenseProps {
  onSubmit: () => void;
  onSkip: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  hasAccount: boolean;
}

export default function StepExpense({ onSubmit, onSkip, onBack, isSubmitting, hasAccount }: StepExpenseProps) {
  const { register, formState: { errors }, control } = useFormContext<OnboardingData>();
  
  const accountName = useWatch({ control, name: 'accountName' });

  // For v1 frontend mock until we fetch from DB
  const mockCategories = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Food & Dining', icon: '🍔' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Transport', icon: '🚌' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Shopping', icon: '🛒' },
  ];

  if (!hasAccount) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-prism-surface flex items-center justify-center mb-4">
          <Info className="w-8 h-8 text-prism-text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-prism-text mb-2">No account created</h2>
        <p className="text-prism-text-muted mb-8">
          You skipped setting up an account, so we can&apos;t add an expense just yet.
        </p>
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="w-full bg-prism-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-prism-violet-700 transition-colors flex justify-center items-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finish Onboarding'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} disabled={isSubmitting} className="p-2 -ml-2 text-prism-text-muted hover:text-prism-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-prism-text-muted tracking-wider uppercase">Step 4 — First Expense</span>
        <div className="w-9" />
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-prism-text mb-2">Add your first expense</h2>
        <p className="text-prism-text-muted">Let&apos;s log something you recently bought.</p>
      </div>

      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-sm font-medium text-prism-text mb-1">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-prism-text-muted text-lg font-medium">₹</span>
            </div>
            <input
              type="number"
              step="0.01"
              {...register('expenseAmount', { valueAsNumber: true })}
              className={`block w-full pl-10 pr-4 py-3 border ${
                errors.expenseAmount ? 'border-prism-danger focus:ring-prism-danger' : 'border-prism-border focus:ring-prism-violet-500'
              } rounded-xl bg-prism-white text-prism-text placeholder-prism-text-muted focus:outline-none focus:ring-2 font-mono text-lg`}
              placeholder="180"
            />
          </div>
          {errors.expenseAmount && <p className="mt-1 text-sm text-prism-danger">{errors.expenseAmount.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-prism-text mb-1">Category</label>
          <select
            {...register('categoryId')}
            className="block w-full px-4 py-3 border border-prism-border rounded-xl bg-prism-white text-prism-text focus:outline-none focus:ring-2 focus:ring-prism-violet-500 appearance-none"
          >
            <option value="">Select a category</option>
            {mockCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-prism-text mb-1">Account</label>
          <input
            type="text"
            value={accountName || 'Primary Account'}
            disabled
            className="block w-full px-4 py-3 border border-prism-border rounded-xl bg-prism-surface text-prism-text-muted cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-prism-text mb-1">Note <span className="text-prism-text-muted font-normal">(Optional)</span></label>
          <input
            type="text"
            {...register('expenseNote')}
            className="block w-full px-4 py-3 border border-prism-border rounded-xl bg-prism-white text-prism-text placeholder-prism-text-muted focus:outline-none focus:ring-2 focus:ring-prism-violet-500"
            placeholder="e.g. Coffee"
          />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-prism-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-prism-violet-700 transition-colors flex justify-center items-center"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add This Expense'}
        </button>
        <button
          type="button"
          onClick={onSkip}
          disabled={isSubmitting}
          className="w-full text-prism-violet-600 font-medium py-3 hover:text-prism-violet-700 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
