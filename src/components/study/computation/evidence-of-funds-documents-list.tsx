'use client';

import { Check, FileText } from 'lucide-react';

type EvidenceOfFundsDocumentsListProps = {
  isCanada: boolean;
  isIreland: boolean;
  isNewZealand: boolean;
};

export default function EvidenceOfFundsDocumentsList({
  isCanada,
  isIreland,
  isNewZealand,
}: EvidenceOfFundsDocumentsListProps) {
  return (
    <div className="h-full rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-center">
        <FileText className="mr-2 h-5 w-5" style={{ color: '#004097' }} />
        <h4 className="text-center text-sm font-semibold" style={{ color: '#004097' }}>
          Evidence of Funds Required Documents
        </h4>
      </div>
      <ul className="grid grid-cols-1 gap-y-1 text-xs text-gray-600">
        <li className="flex items-start">
          <Check className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 text-green-600" />
          <span>Bank Certificate</span>
        </li>
        <li className="flex items-start">
          <Check className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 text-green-600" />
          <span>
            Bank Statement (
            {isCanada ? '6' : isIreland ? '6' : isNewZealand ? '6' : '3'}
            {' '}months history)
          </span>
        </li>
        <li className="flex items-start">
          <Check className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 text-green-600" />
          <span>Affidavit of Support / Statutory Declaration</span>
        </li>
        <li className="flex items-start">
          <Check className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 text-green-600" />
          <span>Proof of relationship to the sponsor</span>
        </li>
        <li className="flex items-start">
          <Check className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 text-green-600" />
          <span>2 valid IDs of the sponsor</span>
        </li>
        <li className="flex items-start">
          <Check className="mt-0.5 mr-2 h-3 w-3 flex-shrink-0 text-green-600" />
          <span>Proof of Ongoing Income</span>
        </li>
      </ul>
    </div>
  );
}
