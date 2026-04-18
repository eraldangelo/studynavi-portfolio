'use client';

import React, { useState, type ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Input } from '@/components/ui/forms/input';
import { Label } from '@/components/ui/forms/label';
import { Textarea } from '@/components/ui/forms/textarea';
import { useToast } from '@/hooks/ui/use-toast';
import type { Answers, Question } from '@/lib/core/types';
import { Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/overlay/tooltip';
import { SchoolAutocompleteInput } from '@/components/common/forms/school-autocomplete-input';
import { buildAuthorizedJsonHeaders } from '@/lib/firebase/client-request-auth';

export default function NonGenuineRecommendationCard({
  question,
  answers,
  onAnswerChange,
}: {
  question: Question;
  answers: Answers;
  onAnswerChange: (id: keyof Answers, value: any) => void;
}) {
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleChange = (id: keyof Answers) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onAnswerChange(id, event.target.value);
  };

  // Helpers for working with multiple recommendation sets
  const blankRec = {
    recommendedSchool: '',
    recommendedProgram: '',
    programDuration: '',
    englishTestRequirement: '',
    approximateCost: '',
    briefInfo: '',
  };

  const getRecs = () => {
    return (answers.nonGenuineRecommendations && Array.isArray(answers.nonGenuineRecommendations))
      ? answers.nonGenuineRecommendations
      : [
          {
            recommendedSchool: answers.recommendedSchool || '',
            recommendedProgram: answers.recommendedProgram || '',
            programDuration: answers.recommendedProgramDuration || '',
            englishTestRequirement: answers.recommendedEnglishTestRequirement || '',
            approximateCost: answers.recommendedApproximateCost || '',
            briefInfo: answers.recommendedBriefInfo || '',
          },
        ];
  };

  function updateRecField(index: number, field: keyof typeof blankRec, value: string) {
    const next = [...getRecs()];
    // ensure index exists
    while (next.length <= index) next.push({ ...blankRec });
    next[index] = { ...next[index], [field]: value };
    onAnswerChange('nonGenuineRecommendations', next);
  }

  function addRecommendation() {
    const recs = getRecs();
    if (recs.length >= 2) {
      toast({ title: 'Maximum reached', description: 'You can add up to 2 recommendations.' });
      return;
    }
    const next = [...recs, { ...blankRec }];
    onAnswerChange('nonGenuineRecommendations', next);
  }

  function removeRecommendation(index: number) {
    const next = getRecs().filter((_, i) => i !== index);
    if (next.length === 0) next.push({ ...blankRec });
    onAnswerChange('nonGenuineRecommendations', next);
  }

  async function handleAutoGenerateIndex(index: number) {
    const rec = getRecs()[index];
    if (!rec?.recommendedSchool?.trim() || !rec?.recommendedProgram?.trim()) return;
    try {
      setGeneratingIndex(index);
      const headers = await buildAuthorizedJsonHeaders();
      const res = await fetch('/api/ai/brief-info', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          recommendedSchool: rec.recommendedSchool,
          recommendedProgram: rec.recommendedProgram,
          programDuration: rec.programDuration,
          englishTestRequirement: rec.englishTestRequirement,
          approximateCost: rec.approximateCost,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate');
      updateRecField(index, 'briefInfo', data.text || '');
    } catch (err: any) {
      toast({ title: 'AI generation failed', description: err?.message || 'Unknown error' });
    } finally {
      setGeneratingIndex(null);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
          {question.icon && <question.icon className="h-7 w-7 text-yellow-500" />}
          {question.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0 space-y-4">
        {getRecs().map((rec, idx) => {
          const briefInfo = rec.briefInfo || '';
          const briefInfoTooShort = briefInfo.length > 0 && briefInfo.length < 150;
          const isGenerating = generatingIndex === idx;
          const canGenerate = rec.recommendedSchool?.trim().length > 0 && rec.recommendedProgram?.trim().length > 0 && generatingIndex === null;

          return (
            <div key={idx} className="space-y-4">
              {idx > 0 && <div className="border-t border-gray-200 my-4" />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`recommendedSchool-${idx}`}>Recommended School</Label>
                  <SchoolAutocompleteInput
                    id={`recommendedSchool-${idx}`}
                    value={rec.recommendedSchool || ''}
                    onChange={(value) => updateRecField(idx, 'recommendedSchool', value)}
                    placeholder="Enter the recommended school"
                  />
                </div>

                  <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`recommendedProgram-${idx}`}>Recommended Program</Label>
                  </div>
                  <Input
                    id={`recommendedProgram-${idx}`}
                    value={rec.recommendedProgram || ''}
                    onChange={(e) => updateRecField(idx, 'recommendedProgram', e.target.value)}
                    placeholder="Enter the recommended program"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`recommendedProgramDuration-${idx}`}>Program Duration</Label>
                  <Input
                    id={`recommendedProgramDuration-${idx}`}
                    value={rec.programDuration || ''}
                    onChange={(e) => updateRecField(idx, 'programDuration', e.target.value)}
                    placeholder="e.g., 2 years"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`recommendedEnglishTestRequirement-${idx}`}>English Test requirement</Label>
                  <Input
                    id={`recommendedEnglishTestRequirement-${idx}`}
                    value={rec.englishTestRequirement || ''}
                    onChange={(e) => updateRecField(idx, 'englishTestRequirement', e.target.value)}
                    placeholder="e.g., IELTS 6.5 overall"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`recommendedApproximateCost-${idx}`}>Approximate Cost</Label>
                  <Input
                    id={`recommendedApproximateCost-${idx}`}
                    value={rec.approximateCost || ''}
                    onChange={(e) => updateRecField(idx, 'approximateCost', e.target.value)}
                    placeholder="Enter estimated cost"
                  />
                </div>

                <div className="hidden md:block" />

                <div className="md:col-span-2">
                  <div className="space-y-2">
                  <div className="flex items-center gap-2">
                        <Label htmlFor={`recommendedBriefInfo-${idx}`}>Brief Information about the School and program</Label>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger
                                    onClick={() => {
                                        if (canGenerate && !isGenerating) {
                                            handleAutoGenerateIndex(idx);
                                        }
                                    }}
                                    asChild
                                >
                                    <span className={!canGenerate || isGenerating ? 'cursor-not-allowed' : 'cursor-pointer'}>
                                        <Sparkles className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''} ${!canGenerate || isGenerating ? 'text-muted-foreground' : 'text-yellow-500' }`} />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{isGenerating ? 'Generating...' : 'Auto-generate with AI'}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <Textarea
                      id={`recommendedBriefInfo-${idx}`}
                      value={briefInfo}
                      onChange={(e) => updateRecField(idx, 'briefInfo', e.target.value)}
                      placeholder="Provide at least 150 characters of context"
                      className="min-h-[120px]"
                    />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{briefInfo.length} / 150 characters</span>
                      {briefInfoTooShort && <span className="text-red-600">Please enter at least 150 characters.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div>
          {getRecs().length < 2 ? (
            <button type="button" className="text-sm text-primary underline font-bold" onClick={addRecommendation}>
              Add another school
            </button>
          ) : (
            <button type="button" className="text-sm text-primary underline font-bold" onClick={() => removeRecommendation(1)}>
              Remove
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
