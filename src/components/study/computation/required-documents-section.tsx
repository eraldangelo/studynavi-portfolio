
'use client';

import type { Answers } from "@/lib/core/types";
import { getDocsForEducation } from "@/lib/education/documents";
import { Check, FileText } from "lucide-react";

interface RequiredDocumentsSectionProps {
    answers: Answers;
}

export default function RequiredDocumentsSection({ answers }: RequiredDocumentsSectionProps) {
    const isIreland = answers.studyDestination === 'Ireland';

    // Get all documents and then sort them so optional ones are last.
    const allFilteredDocuments = getDocsForEducation(answers).sort((a, b) => {
        const aIsOptional = a.subLabel === '(optional)';
        const bIsOptional = b.subLabel === '(optional)';
        const aIsVisaStamps = a.id === 'visaStamps';
        const bIsVisaStamps = b.id === 'visaStamps';
        const aIsPRC = a.id === 'prc';
        const bIsPRC = b.id === 'prc';

        // "All Visa Stamps" always goes to the very end.
        if (aIsVisaStamps) return 1;
        if (bIsVisaStamps) return -1;

        // "PRC License" goes just before "All Visa Stamps".
        if (aIsPRC && bIsOptional) return 1;
        if (bIsPRC && aIsOptional) return -1;

        // Other optional items go after non-optional items.
        if (aIsOptional && !bIsOptional) return 1;
        if (!aIsOptional && bIsOptional) return -1;
        
        // Otherwise, maintain original order.
        return 0;
    });

    const renderDocList = () => {
        if (allFilteredDocuments.length === 0) {
            return null;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-2 text-xs text-gray-600">
                {allFilteredDocuments.map(doc => (
                    <div key={doc.id} className="flex items-start gap-2">
                        <Check className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <span>{doc.label}</span>
                            {doc.subLabel && <span className="block text-xs text-muted-foreground">{doc.subLabel}</span>}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <table className="w-full text-xs">
            <thead>
                <tr className="bg-[#004097] text-yellow-100 font-bold">
                    <th colSpan={3} className="p-1.5 text-center">
                        <div className="flex justify-center items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>School Application / Visa Application Required Documents</span>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colSpan={3} className="p-2">
                        {renderDocList()}
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

