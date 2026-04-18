'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/overlay/dialog';
import type { ModalContent, Answers } from '@/lib/core/types';
import { Button } from '@/components/ui/forms/button';
import { parseText, renderDescriptionItem } from './info-modal.utils';

interface InfoModalProps {
  isOpen: boolean;
  content: ModalContent | null;
  onClose: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  answers?: Answers;
}

export default function InfoModal({
  isOpen,
  content,
  onClose,
  onConfirm,
  onCancel,
  answers,
}: InfoModalProps) {
  if (!content) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    else onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    else onClose();
  };

  const showFooterButtons = !!content.primaryButtonText || !!content.secondaryButtonText;
  const showStoplightButton = !showFooterButtons && content.hideDefaultCloseButton === true;
  const showDefaultCloseButton = !showFooterButtons && !showStoplightButton;
  const isLongTitle = content.title.length > 40;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={showDefaultCloseButton}
        className="flex flex-col md:flex-row max-w-3xl p-0 overflow-hidden gap-0 max-h-[90vh] w-[95%]"
      >
        {showStoplightButton && (
          <button
            onClick={onClose}
            className="group absolute top-4 left-4 h-4 w-4 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center z-20"
            aria-label="Close modal"
          >
            <svg
              className="h-2.5 w-2.5 text-[#9a0000] opacity-0 group-hover:opacity-100 transition-opacity"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.33333 3.66667L3.66667 8.33333M3.66667 3.66667L8.33333 8.33333"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {content.imageUrl && (
          <div
            className={`w-full md:w-[35%] flex-shrink-0 flex items-center justify-center bg-gray-50 border-b md:border-b-0 md:border-r ${showStoplightButton ? 'pt-16' : 'pt-8'} md:pt-0`}
          >
            <img
              src={content.imageUrl}
              alt={content.imageAlt}
              className="w-24 h-auto md:w-48 object-contain p-4 md:p-6"
            />
          </div>
        )}

        <div className="flex flex-col flex-grow w-full md:w-[65%] p-6 md:p-8 overflow-y-auto">
          <DialogHeader className="p-0 text-left space-y-4">
            <DialogTitle
              className={`text-[#0033a1] font-bold leading-tight ${isLongTitle ? 'text-base md:text-xl' : 'text-lg md:text-2xl'}`}
            >
              {parseText(content.title, answers)}
            </DialogTitle>

            <DialogDescription asChild>
              <div className="text-sm text-gray-600 space-y-4 max-h-[50vh] overflow-y-auto pr-2 md:pr-4">
                {content.description.map((item, index) => renderDescriptionItem(item, index, answers))}
              </div>
            </DialogDescription>
          </DialogHeader>

          {showFooterButtons && (
            <div className="p-0 mt-6 md:mt-8 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 w-full">
              {content.secondaryButtonText ? (
                <>
                  <Button onClick={handleCancel} variant="destructive" className="w-full sm:w-auto">
                    {content.secondaryButtonText}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="bg-[#fcd34d] hover:bg-[#fbbf24] text-black font-medium border-0 w-full sm:w-auto"
                  >
                    {content.primaryButtonText || 'Acknowledge and Proceed'}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleConfirm}
                  className="bg-[#fcd34d] hover:bg-[#fbbf24] text-black font-medium border-0 w-full sm:w-auto ml-auto"
                >
                  {content.primaryButtonText || 'Acknowledge'}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
