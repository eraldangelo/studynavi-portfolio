
import { Flag, MapPin } from 'lucide-react';

interface WizardHeaderProps {
  currentStep: number;
  totalSteps: number;
  onStepClick: (step: number) => void;
}

const StepIndicator = ({ currentStep, totalSteps, onStepClick }: { currentStep: number, totalSteps: number, onStepClick: (step: number) => void }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  const handleStepClick = (step: number) => {
    // Allow navigation only to previous steps
    if (step < currentStep) {
      onStepClick(step);
    }
  };

  return (
    <div className="flex items-center justify-center">
      {/* Mobile View: Compact Text */}
      <div className="sm:hidden">
          <span className="text-sm font-semibold" style={{ color: '#004097' }}>
              Step {currentStep} of {totalSteps}
          </span>
      </div>

      {/* Desktop View: Visual Step Timeline */}
      <div className="hidden sm:flex items-center">
        <span className="mr-4 text-base font-semibold" style={{ color: '#004097' }}>Steps:</span>
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <button
                onClick={() => handleStepClick(step)}
                disabled={step >= currentStep}
                className="relative flex flex-col items-center disabled:cursor-not-allowed"
                aria-label={`Go to step ${step}`}
              >
                {currentStep === step ? (
                  <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-yellow-500 bg-white flex items-center justify-center">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#004097]" />
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
                      step < currentStep
                        ? 'bg-[#004097] text-white hover:bg-[#00337a]'
                        : 'bg-yellow-400 text-yellow-900'
                    }`}
                  >
                    {step === totalSteps ? (
                        <Flag className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                        step
                    )}
                  </div>
                )}
              </button>
              {index < totalSteps - 1 && (
                <div
                  className={`flex-1 h-1 transition-colors duration-300 mx-1 ${
                    step < currentStep ? 'bg-[#004097]' : 'bg-yellow-400'
                  }`}
                  style={{ minWidth: '0.5rem', maxWidth: '1.5rem' }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


export function WizardHeader({ currentStep, totalSteps, onStepClick }: WizardHeaderProps) {
  return (
    <div className="py-2">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} onStepClick={onStepClick} />
    </div>
  );
}
