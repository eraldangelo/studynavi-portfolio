
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Check } from "lucide-react";
import type { WizardStepProps } from "@/lib/core/types";
import { FileText } from "lucide-react";
import { getDocsForEducation } from '@/lib/education/documents';

export default function RequiredDocumentsCard({ question, answers }: WizardStepProps) {
  
  const filteredDocuments = getDocsForEducation(answers);
  const totalDocuments = filteredDocuments.length;
  let columns: { label: string; subLabel?: string }[][] = [];
  let numberOfColumns = 0;

  if (totalDocuments > 0) {
    numberOfColumns = Math.min(3, totalDocuments);
    columns = Array.from({ length: numberOfColumns }, () => []);
    filteredDocuments.forEach((doc, index) => {
      columns[index % numberOfColumns].push(doc);
    });
  }

  const gridClasses: { [key: number]: string } = {
    1: 'lg:grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
  };

  const lgGridClass = numberOfColumns > 0 ? gridClasses[numberOfColumns] : 'lg:grid-cols-3';

  return (
    <Card className="w-full">
        <CardHeader className="p-4 pb-4 md:p-6 md:pb-4">
            <CardTitle className="flex items-center gap-3 text-xl md:text-2xl text-[#004097]">
                <FileText className="h-7 w-7 text-yellow-500" />
                {question.title}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <p className="mb-6 text-muted-foreground">Here is a list of documents that may be required for the application, based on your answers.</p>
            <div className={`grid grid-cols-1 md:grid-cols-2 ${lgGridClass} gap-x-8 gap-y-4`}>
                {columns.map((column, colIndex) => (
                    <div key={colIndex} className="flex flex-col gap-y-4">
                        {column.map((doc, docIndex) => (
                            <div key={docIndex} className="flex items-start">
                                <Check className="h-5 w-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-card-foreground">{doc.label}</span>
                                    {doc.subLabel && <span className="block text-xs text-muted-foreground">{doc.subLabel}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
             <p className="text-red-500 italic text-center mt-8 text-base">※ Please note that this is not an exhaustive list. All documents must be in PDF format, colored, and high-quality.</p>
        </CardContent>
    </Card>
  );
}
