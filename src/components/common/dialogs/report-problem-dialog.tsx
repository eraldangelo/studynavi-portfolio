
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/overlay/dialog';
import { Button } from '@/components/ui/forms/button';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { Paperclip, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';

interface ReportProblemDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReportProblemDialog({ isOpen, onOpenChange }: ReportProblemDialogProps) {
  const { toast } = useToast();
  const [from, setFrom] = useState('');
  const [problem, setProblem] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [emailError, setEmailError] = useState('');

  const canSend = from && problem && !emailError;

  const handleSend = () => {
    toast({
      title: 'Coming Soon',
      description: 'This feature is under development and will be available shortly.',
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    toast({
        title: 'Coming Soon',
        description: 'Attaching files will be available in a future update.',
    });
    // Prevent file from actually being selected
    e.target.value = ''; 
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrom(e.target.value);
    if (emailError && emailRegex.test(e.target.value)) {
      setEmailError('');
    }
  }

  const handleBlur = () => {
    if (from && !emailRegex.test(from)) {
      setEmailError('This is not a valid email address.');
    } else {
      setEmailError('');
    }
  };

  const handleClose = () => {
    // Reset state on close
    onOpenChange(false);
    setFrom('');
    setProblem('');
    setFile(null);
    setEmailError('');
    setIsSending(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0" showCloseButton={false}>
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-none w-10">
               <button 
                  onClick={handleClose}
                  className="group h-3.5 w-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e] flex items-center justify-center z-20"
                  aria-label="Close modal"
                >
                    <X className="h-2 w-2 text-[#9a0000] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
            <div className="flex-grow text-center">
              <DialogTitle className="text-base" style={{ color: '#004097' }}>Report a Problem or Glitch</DialogTitle>
            </div>
            <div className="flex-none w-10"></div>
          </div>
          <DialogDescription className="text-center text-xs px-4 pt-2">
            Your feedback helps us improve StudyNavi. Please describe the issue you encountered. As much as possible please attach screenshot so that we an address your concern properly.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 px-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="from" className="text-right">
              From:
            </Label>
            <div className="col-span-3">
              <Input
                id="from"
                type="email"
                placeholder="your.email@example.com"
                value={from}
                onChange={handleFromChange}
                onBlur={handleBlur}
                className={emailError ? 'border-destructive' : ''}
              />
              {emailError && <p className="text-xs text-destructive mt-1">{emailError}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="problem" className="text-right pt-2">
              Problem:
            </Label>
            <Textarea
              id="problem"
              placeholder="Describe the problem or glitch in detail..."
              className="col-span-3 min-h-[120px]"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter className="flex-row sm:justify-between items-center bg-slate-50 p-3 border-t">
            <div className="flex items-center gap-2">
                 <Button asChild variant="outline" size="icon" className="relative cursor-pointer rounded-full h-8 w-8">
                    <div>
                        <Paperclip className="h-4 w-4" />
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                    </div>
                </Button>
                {file && <span className="text-sm text-muted-foreground truncate max-w-[150px]">{file.name}</span>}
            </div>
            <Button onClick={handleSend} disabled={!canSend || isSending} size="icon" className="rounded-full h-8 w-8 bg-primary text-primary-foreground hover:bg-primary/90">
                {isSending ? <Send className="h-4 w-4 animate-pulse" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
