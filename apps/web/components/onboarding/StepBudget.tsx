import { useFormContext } from 'react-hook-form';
import { OnboardingData } from '../../hooks/use-onboarding';
import { ArrowLeft } from 'lucide-react';

export default function StepBudget({ onNext, onSkip, onBack }: { onNext: () => void; onSkip: () => void; onBack: () => void }) {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-prism-text-muted hover:text-prism-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-prism-text-muted tracking-wider uppercase">Step 3 — Monthly Budget</span>
        <div className="w-9" />
      </div>
      
      <div className="text-center mb-12">
        <h2 className="text-2xl font-semibold text-prism-text mb-2">How much can you spend per month?</h2>
        <p className="text-prism-text-muted">This sets your overall monthly spending limit.</p>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center -mt-8">
        <div className="w-full max-w-xs relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="text-prism-violet-500 text-3xl font-medium">₹</span>
          </div>
          <input
            type="number"
            step="100"
            {...register('budgetAmount', { valueAsNumber: true })}
            className={`block w-full pl-12 pr-4 py-4 border-b-2 bg-transparent text-center ${
              errors.budgetAmount ? 'border-prism-danger text-prism-danger' : 'border-prism-violet-200 text-prism-text focus:border-prism-violet-500'
            } focus:outline-none font-mono text-4xl transition-colors`}
            placeholder="18000"
          />
        </div>
        {errors.budgetAmount && <p className="mt-4 text-sm text-prism-danger text-center">{errors.budgetAmount.message}</p>}
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onNext}
          className="w-full bg-prism-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-prism-violet-700 transition-colors"
        >
          Set Budget
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-prism-violet-600 font-medium py-3 hover:text-prism-violet-700 transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
