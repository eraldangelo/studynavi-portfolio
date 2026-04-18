'use client';

import { ArrowLeft, CheckCircle2, Download, FileSearch, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/forms/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlay/tooltip';
import { isDownloadPdfDisabled } from '@/components/study/wizard/study-wizard.utils';

type WizardCompleteViewProps = {
  schoolName?: string;
  onCreateAnother: () => void;
};

type WizardReviewViewProps = {
  pdfUrl: string | null;
  isPreviewLoading: boolean;
  isIos: boolean;
  isDownloading: boolean;
  onBack: () => void;
  onStartOver: () => void;
  onDownload: () => void;
};

export function WizardCompleteView({ schoolName, onCreateAnother }: WizardCompleteViewProps) {
  return (
    <div className="animate-in fade-in-50 duration-500">
      <Card className="w-full max-w-md mx-auto text-center py-10">
        <CardHeader>
          <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="brand-heading">
            <span className="brand-blue">Study</span>
            <span className="brand-yellow">Navi</span>
            <span className="brand-blue ml-2">Guide Downloaded</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {schoolName || 'The school'}
            {"'s"} guide has been generated and downloaded successfully.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button onClick={onCreateAnother} size="lg">
            Create Another Plan
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export function WizardReviewView({
  pdfUrl,
  isPreviewLoading,
  isIos,
  isDownloading,
  onBack,
  onStartOver,
  onDownload,
}: WizardReviewViewProps) {
  return (
    <div key="review-step" className="space-y-4 animate-in fade-in-0 duration-500">
      <div
        id="computation-sheet-container"
        className="relative mx-auto w-full max-w-[210mm] border shadow-lg print:border-none print:shadow-none bg-white"
      >
        {!pdfUrl ? (
          <div className="flex min-h-[60vh] sm:min-h-[800px] items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Generating PDF Preview...</p>
          </div>
        ) : isIos ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[800px] p-6 sm:p-8 text-center">
            <FileSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">PDF Preview Unavailable on this Device</h3>
            <p className="text-muted-foreground mb-6">
              Due to iOS restrictions, the PDF cannot be displayed here. Please open it in a new tab.
            </p>
            <Button onClick={() => window.open(pdfUrl, '_blank')}>Open PDF Preview</Button>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="h-[70vh] sm:h-[600px] md:h-[800px] w-full"
          >
            <p>Your browser does not support PDFs. Please download the PDF to view it.</p>
          </iframe>
        )}
        {isPreviewLoading && !!pdfUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/75">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Refreshing PDF Preview...</p>
          </div>
        )}
      </div>

      <TooltipProvider>
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden pt-4">
          <div className="flex gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onBack}
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onStartOver}
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
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onDownload}
                disabled={isDownloadPdfDisabled(isDownloading, pdfUrl)}
                aria-label="Download PDF and finish"
                data-testid="download-pdf-button"
                size="icon"
                className="bg-green-600 text-white hover:bg-green-700 rounded-full h-12 w-12 sm:h-10 sm:w-10"
              >
                {isDownloading ? (
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
        </div>
      </TooltipProvider>
    </div>
  );
}
