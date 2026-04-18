'use client';

import { StudyWizard } from '@/components/study/wizard/study-wizard';
import { WizardHeader } from '@/components/study/wizard/wizard-header';
import { useStudyWizard } from '@/hooks/study/use-study-wizard';
import { AppHeader } from '@/components/common/layout/app-header';
import AiChatbotBubble from '@/components/common/ai-chatbot/ai-chatbot-bubble';

export default function HomeClient() {
  const wizard = useStudyWizard();
  const showHeader = !wizard.isComplete;

  return (
    <>
      <div className="min-h-screen bg-background font-body text-foreground">
        <AppHeader showControls={true} />

        {showHeader && (
          <div className="sticky top-16 z-40 border-b bg-card shadow-sm">
            <div className="container mx-auto max-w-4xl px-4">
               <WizardHeader currentStep={wizard.currentStep} totalSteps={wizard.effectiveTotalSteps} onStepClick={wizard.handleSetStep} />
            </div>
          </div>
        )}

        <StudyWizard wizard={wizard} />
        <AiChatbotBubble />
      </div>
      {/* Root layout mounts <Toaster /> globally; avoid duplicate mount here. */}
    </>
  );
}
