'use client';

import { Button } from "@/components/ui/forms/button";
import { ArrowLeft, ArrowRight, Check, Download, Loader2, RotateCcw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/overlay/tooltip";

interface WizardNavigationProps {
    currentStep: number;
    effectiveTotalSteps: number;
    isComplete: boolean;
    isAnswered: boolean;
    isLoading: boolean;
    isLocked?: boolean; 
    handleBack: () => void;
    handleNext: () => void;
    handleReset: () => void;
    handleFinish?: () => void;
    isNonGenuineFlow?: boolean;
    onDownloadNonGenuine?: () => void;
    canDownloadNonGenuine?: boolean;
    isDownloadingNonGenuine?: boolean;
}

export function WizardNavigation({
    currentStep,
    effectiveTotalSteps,
    isComplete,
    isAnswered,
    isLoading,
    isLocked = false,
    handleBack,
    handleNext,
    handleReset,
    handleFinish,
    isNonGenuineFlow = false,
    onDownloadNonGenuine,
    canDownloadNonGenuine = true,
    isDownloadingNonGenuine = false,
}: WizardNavigationProps) {
    if (isComplete) {
        return null;
    }

    const isReviewStep = !isNonGenuineFlow && currentStep === effectiveTotalSteps;
    const isNonGenuineDownloadStep = isNonGenuineFlow && currentStep === effectiveTotalSteps;

    return (
        <TooltipProvider>
            <div className="sticky bottom-0 z-40 -mx-4 sm:mx-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:border-0 sm:bg-transparent sm:px-0 sm:py-4">
                    <div className="flex flex-wrap gap-3">
                    {currentStep > 1 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleBack}
                                    size="icon"
                                    className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full h-12 w-12 sm:h-10 sm:w-10"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Back</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {currentStep > 1 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleReset}
                                    variant="destructive"
                                    size="icon"
                                    className="rounded-full h-12 w-12 sm:h-10 sm:w-10"
                                >
                                    <RotateCcw className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Start Over</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    </div>
                    
                    {!isReviewStep && !isNonGenuineDownloadStep && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleNext}
                                    disabled={!isAnswered || isLoading || isLocked}
                                    size="icon"
                                    className="bg-[#004097] text-white hover:bg-[#00337a] rounded-full h-12 w-12 sm:h-10 sm:w-10"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <ArrowRight className="h-5 w-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Next</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {isNonGenuineDownloadStep && onDownloadNonGenuine && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={onDownloadNonGenuine}
                                    disabled={!canDownloadNonGenuine || isLoading || isLocked || isDownloadingNonGenuine}
                                    size="icon"
                                    className="bg-green-600 text-white hover:bg-green-700 rounded-full h-12 w-12 sm:h-10 sm:w-10"
                                >
                                    {isDownloadingNonGenuine ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Download className="h-5 w-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download PDF & Finish</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                    {isReviewStep && handleFinish && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={handleFinish}
                                    disabled={isLoading}
                                    size="icon"
                                    className="bg-green-600 text-white hover:bg-green-700 rounded-full h-12 w-12 sm:h-10 sm:w-10"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Check className="h-5 w-5" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                 <p>Finish</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
        </TooltipProvider>
    );
}
