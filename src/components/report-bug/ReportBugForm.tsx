'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { Button } from '@/components/ui/forms/button';
import { useToast } from '@/hooks/ui/use-toast';
import { submitReport } from '@/services/bugs/report-bug';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReportBugForm() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [issue, setIssue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/png', 'image/jpeg'].includes(f.type)) {
      toast({ title: 'Invalid file', description: 'Only JPG and PNG are allowed.' });
      e.target.value = '';
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max file size is 5MB.' });
      e.target.value = '';
      return;
    }
    setFile(f);
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      return '';
    }
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address.');
      return 'Please enter a valid email address.';
    }
    if (!value.toLowerCase().endsWith('@example.com')) {
      setEmailError('Please use your @example.com email address.');
      return 'Please use your @example.com email address.';
    }
    setEmailError('');
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !issue) {
      toast({ title: 'Missing fields', description: 'Please fill all fields.' });
      return;
    }
    const emailValidationError = validateEmail(email);
    if (emailValidationError) {
      toast({ title: 'Invalid email', description: emailValidationError });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport({ name, email, issue, file });

      toast({ title: 'Report submitted', description: 'Thanks - your report was received.' });
      setName('');
      setEmail('');
      setIssue('');
      setFile(null);
      // notify listeners to refresh recent reports
      try {
        window.dispatchEvent(new Event('report:submitted'));
      } catch (e) {
        /* ignore */
      }
    } catch (err: any) {
      console.error('[ReportBugForm] submit failed:', err);
      const message = err?.message || String(err) || 'Please try again later.';
      toast({ title: 'Submission failed', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 max-w-3xl">
      {/* Row 1: Name and work email side-by-side */}
      <div className="grid grid-cols-12 items-center gap-4">
        <Label htmlFor="name" className="col-span-2 text-right font-semibold">Your name:<span className="text-red-600 ml-1">*</span></Label>
        <div className="col-span-4">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. John"
            className="placeholder:text-muted-foreground placeholder:italic shadow-sm"
          />
        </div>

        <Label htmlFor="email" className="col-span-2 text-right font-semibold">Your Work Email:<span className="text-red-600 ml-1">*</span></Label>
        <div className="col-span-4">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? 'email-error' : undefined}
            placeholder="example@example.com"
            className={`${emailError ? 'border-red-600 ring-1 ring-red-600' : ''} placeholder:text-muted-foreground placeholder:italic shadow-sm`}
          />
          {emailError ? <p id="email-error" className="text-sm text-red-600 mt-1">{emailError}</p> : null}
        </div>
      </div>

      {/* Row 2: Issue / Bug report full width */}
      <div className="grid grid-cols-12 items-start gap-4">
        <Label htmlFor="issue" className="col-span-2 text-right pt-2 font-semibold">Issues / Bug report:<span className="text-red-600 ml-1">*</span></Label>
        <Textarea id="issue" value={issue} onChange={(e) => setIssue(e.target.value)} className="col-span-10 min-h-[140px]" />
      </div>

      {/* Row 3: Upload screenshot with red asterisk indicating optional/required */}
      <div className="grid grid-cols-12 items-center gap-4">
        <Label className="col-span-2 text-right font-semibold">Upload Screenshot:<span className="text-red-600 ml-1">*</span></Label>
        <div className="col-span-10 flex items-center gap-3">
          <input type="file" accept="image/png,image/jpeg" onChange={onFileChange} />
          {file && <span className="text-sm text-muted-foreground truncate max-w-[240px]">{file.name}</span>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </form>
  );
}
