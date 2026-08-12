import { useFormContext, useWatch } from 'react-hook-form';
import { OnboardingData } from '../../hooks/use-onboarding';
import { Banknote, Landmark, Smartphone, PiggyBank, BriefcaseMedical, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function StepAccount({ onNext, onSkip, onBack }: { onNext: () => void; onSkip: () => void; onBack: () => void }) {
  const { register, setValue, formState: { errors }, control } = useFormContext<OnboardingData>();
  
  const accountType = useWatch({ control, name: 'accountType' });

  const accountTypes = [
    { id: 'cash', label: 'Cash', icon: Banknote },
    { id: 'bank', label: 'Bank', icon: Landmark },
    { id: 'wallet', label: 'Wallet', icon: Smartphone },
    { id: 'fd', label: 'FD', icon: BriefcaseMedical },
    { id: 'savings', label: 'Savings', icon: PiggyBank },
    { id: 'emergency', label: 'Emergency', icon: ShieldAlert },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-prism-text-muted hover:text-prism-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-prism-text-muted tracking-wider uppercase">Step 2 — First Account</span>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-prism-text mb-2">Where does your money live?</h2>
        <p className="text-prism-text-muted">Let&apos;s add your primary account.</p>
      </div>

      <div className="space-y-6 flex-grow">
        <div>
          {/* Horizontal scroll for account types */}
          <div className="flex overflow-x-auto pb-2 -mx-2 px-2 space-x-3 snap-x scrollbar-hide">
            {accountTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = accountType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setValue('accountType', type.id as any, { shouldValidate: true })}
                  className={`flex-shrink-0 snap-center flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-prism-violet-500 bg-prism-violet-50 text-prism-violet-700'
                      : 'border-prism-border bg-prism-white text-prism-text-muted hover:border-prism-violet-200 hover:bg-prism-surface'
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-2 ${isSelected ? 'text-prism-violet-600' : ''}`} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
          {errors.accountType && <p className="mt-1 text-sm text-prism-danger">{errors.accountType.message}</p>}
        </div>

        {accountType && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div>
              <label className="block text-sm font-medium text-prism-text mb-1">Account Name</label>
              <input
                type="text"
                {...register('accountName')}
                className={`block w-full px-4 py-3 border ${
                  errors.accountName ? 'border-prism-danger focus:ring-prism-danger' : 'border-prism-border focus:ring-prism-violet-500'
                } rounded-xl bg-prism-white text-prism-text placeholder-prism-text-muted focus:outline-none focus:ring-2`}
                placeholder={accountType === 'bank' ? 'e.g. HDFC Savings' : 'e.g. Cash Wallet'}
              />
              {errors.accountName && <p className="mt-1 text-sm text-prism-danger">{errors.accountName.message}</p>}
            </div>

            {accountType === 'bank' && (
              <div>
                <label className="block text-sm font-medium text-prism-text mb-1">Last 4 digits <span className="text-prism-text-muted font-normal">(Optional)</span></label>
                <input
                  type="text"
                  maxLength={4}
                  {...register('last4Digits')}
                  className="block w-full px-4 py-3 border border-prism-border rounded-xl bg-prism-white text-prism-text placeholder-prism-text-muted focus:outline-none focus:ring-2 focus:ring-prism-violet-500"
                  placeholder="e.g. 4821"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-prism-text mb-1">Opening balance</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-prism-text-muted text-lg font-medium">₹</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  {...register('openingBalance', { valueAsNumber: true })}
                  className={`block w-full pl-10 pr-4 py-3 border ${
                    errors.openingBalance ? 'border-prism-danger focus:ring-prism-danger' : 'border-prism-border focus:ring-prism-violet-500'
                  } rounded-xl bg-prism-white text-prism-text placeholder-prism-text-muted focus:outline-none focus:ring-2 font-mono text-lg`}
                  placeholder="0.00"
                />
              </div>
              {errors.openingBalance && <p className="mt-1 text-sm text-prism-danger">{errors.openingBalance.message}</p>}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onNext}
          disabled={!accountType}
          className={`w-full text-white rounded-xl py-3 font-semibold transition-colors ${
            accountType ? 'bg-prism-violet-600 hover:bg-prism-violet-700' : 'bg-prism-violet-200 cursor-not-allowed'
          }`}
        >
          Add Account
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
