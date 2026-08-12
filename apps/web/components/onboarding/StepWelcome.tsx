import { useFormContext } from 'react-hook-form';
import { OnboardingData } from '../../hooks/use-onboarding';
import { User, GraduationCap } from 'lucide-react';

export default function StepWelcome({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-center mb-6">
        {/* Simple placeholder logo for Prism */}
        <div className="w-16 h-16 rounded-2xl bg-prism-violet-50 flex items-center justify-center">
          <svg className="w-8 h-8 text-prism-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-prism-text mb-2">Welcome to Prism 👋</h2>
        <p className="text-prism-text-muted">Let&apos;s set you up in 2 minutes.</p>
      </div>

      <div className="space-y-4 flex-grow">
        <div>
          <label className="block text-sm font-medium text-prism-text mb-1">Your name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-prism-text-muted" />
            </div>
            <input
              type="text"
              {...register('fullName')}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.fullName ? 'border-prism-danger focus:ring-prism-danger' : 'border-prism-border focus:ring-prism-violet-500'
              } rounded-xl bg-prism-white text-prism-text placeholder-prism-text-muted focus:outline-none focus:ring-2`}
              placeholder="e.g. Rahul Sharma"
            />
          </div>
          {errors.fullName && <p className="mt-1 text-sm text-prism-danger">{errors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-prism-text mb-1">College / University <span className="text-prism-text-muted font-normal">(Optional)</span></label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap className="h-5 w-5 text-prism-text-muted" />
            </div>
            <input
              type="text"
              {...register('college')}
              className={`block w-full pl-10 pr-3 py-3 border ${
                errors.college ? 'border-prism-danger focus:ring-prism-danger' : 'border-prism-border focus:ring-prism-violet-500'
              } rounded-xl bg-prism-white text-prism-text placeholder-prism-text-muted focus:outline-none focus:ring-2`}
              placeholder="e.g. IIT Bombay"
            />
          </div>
          {errors.college && <p className="mt-1 text-sm text-prism-danger">{errors.college.message}</p>}
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={onNext}
          className="w-full bg-prism-violet-600 text-white rounded-xl py-3 font-semibold hover:bg-prism-violet-700 transition-colors"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-prism-violet-600 font-medium py-3 hover:text-prism-violet-700 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
