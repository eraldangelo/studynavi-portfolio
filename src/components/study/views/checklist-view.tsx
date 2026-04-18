"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/layout/card";
import { Button } from "@/components/ui/forms/button";
import { CheckCircle2 } from "lucide-react";

interface ChecklistViewProps {
  checklist: string;
  onReset: () => void;
}

const ChecklistContent = ({ content }: { content: string }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  return (
    <div className="space-y-4 text-card-foreground">
      {lines.map((line, index) => {
        if (line.startsWith('* ')) {
          return (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <p className="flex-1">{line.substring(2)}</p>
            </div>
          );
        }
        if (line.startsWith('#')) {
            const level = line.match(/^#+/)?.[0].length || 1;
            const text = line.replace(/^#+\s*/, '');
            if (level === 2) return <h2 key={index} className="mt-6 border-b pb-2 text-xl font-semibold tracking-tight">{text}</h2>
            if (level >= 3) return <h3 key={index} className="mt-4 text-lg font-semibold">{text}</h3>
        }
        return <p key={index}>{line}</p>;
      })}
    </div>
  );
};


export function ChecklistView({ checklist, onReset }: ChecklistViewProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">The Student's Personalized Checklist</CardTitle>
        <CardDescription>
          Based on the student's answers, here are the recommended next steps and documents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChecklistContent content={checklist} />
      </CardContent>
      <CardFooter>
        <Button onClick={onReset} className="w-full" size="lg">
          Start Over
        </Button>
      </CardFooter>
    </Card>
  );
}
