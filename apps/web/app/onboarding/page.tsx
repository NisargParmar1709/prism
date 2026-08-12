'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useOnboarding } from '../../hooks/use-onboarding';
import { FormProvider } from 'react-hook-form';
import StepWelcome from '../../components/onboarding/StepWelcome';
import StepAccount from '../../components/onboarding/StepAccount';
import StepBudget from '../../components/onboarding/StepBudget';
import StepExpense from '../../components/onboarding/StepExpense';
import StepSuccess from '../../components/onboarding/StepSuccess';

const pageVariants = {
  initial: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  in: {
    x: 0,
    opacity: 1,
  },
  out: (direction: number) => {
    return {
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

export default function OnboardingPage() {
  const {
    form,
    currentStep,
    isSubmitting,
    skippedSteps,
    goToNextStep,
    skipStep,
    goToPrevStep,
    submitOnboarding,
    completeOnboarding,
  } = useOnboarding();

  return (
    <div className="min-h-screen bg-prism-surface flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-prism-white rounded-2xl shadow-sm border border-prism-border p-6 md:p-8 overflow-hidden relative min-h-[400px]">
        
        {/* Progress indicator */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 w-8 rounded-full ${
                      step === currentStep
                        ? 'bg-prism-violet-600'
                        : step < currentStep
                        ? 'bg-prism-violet-200'
                        : 'bg-prism-elevated'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-prism-text-muted font-medium">
                Step {currentStep} of 4
              </span>
            </div>
          </div>
        )}

        <FormProvider {...form}>
          <div className="relative w-full h-full">
            <AnimatePresence mode="wait" custom={1}>
              <motion.div
                key={currentStep}
                custom={1}
                variants={pageVariants}
                initial="initial"
                animate="in"
                exit="out"
                transition={pageTransition}
                className="w-full"
              >
                {currentStep === 1 && (
                  <StepWelcome onNext={() => goToNextStep(1)} onSkip={() => skipStep(1)} />
                )}
                {currentStep === 2 && (
                  <StepAccount
                    onNext={() => goToNextStep(2)}
                    onSkip={() => skipStep(2)}
                    onBack={goToPrevStep}
                  />
                )}
                {currentStep === 3 && (
                  <StepBudget
                    onNext={() => goToNextStep(3)}
                    onSkip={() => skipStep(3)}
                    onBack={goToPrevStep}
                  />
                )}
                {currentStep === 4 && (
                  <StepExpense
                    isSubmitting={isSubmitting}
                    onSubmit={form.handleSubmit(submitOnboarding)}
                    onSkip={() => form.handleSubmit(submitOnboarding)()}
                    onBack={goToPrevStep}
                    hasAccount={!skippedSteps.has(2)}
                  />
                )}
                {currentStep === 5 && <StepSuccess onComplete={completeOnboarding} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}
