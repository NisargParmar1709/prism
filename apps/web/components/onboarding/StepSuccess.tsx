import { CheckCircle2 } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { OnboardingData } from '../../hooks/use-onboarding';

export default function StepSuccess({ onComplete }: { onComplete: () => void }) {
  const { control } = useFormContext<OnboardingData>();
  
  const expenseAmount = useWatch({ control, name: 'expenseAmount' });
  const hasExpense = expenseAmount !== undefined && expenseAmount > 0;

  return (
    <div className="flex flex-col h-full items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-prism-success-bg flex items-center justify-center mb-6 animate-in zoom-in duration-500">
        <CheckCircle2 className="w-10 h-10 text-prism-success" />
      </div>
      
      <h2 className="text-2xl font-semibold text-prism-text mb-3">
        {hasExpense ? `₹${expenseAmount} logged! 🎉` : 'All set! 🎉'}
      </h2>
      
      <p className="text-prism-text-muted mb-8 max-w-[260px]">
        Your Prism account is ready. Time to see your money clearly.
      </p>

      <button
        type="button"
        onClick={onComplete}
        className="w-full bg-prism-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-prism-violet-700 transition-colors"
      >
        Go to Dashboard &rarr;
      </button>
    </div>
  );
}
