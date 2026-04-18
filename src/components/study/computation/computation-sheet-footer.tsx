
'use client';

import type { Answers } from "@/lib/core/types";
import type { ExchangeRates } from "@/services/exchange-rate-service";
import { getCurrencyInfo } from "@/lib/currency";

interface ComputationSheetFooterProps {
    generatedDate: string;
    answers: Answers;
    exchangeRates: ExchangeRates;
}

export default function ComputationSheetFooter({ generatedDate, answers, exchangeRates }: ComputationSheetFooterProps) {
    const { currencySymbol, phpRate } = getCurrencyInfo(answers.studyDestination, exchangeRates);
    const isIreland = answers.studyDestination === 'Ireland';

    return (
        <div className="mt-8 border-t pt-4 text-[10px] flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left pdf-section">
            <p style={{ color: '#004097' }}>Generated on: {generatedDate}</p>
            {isIreland ? (
                <p className="font-bold">EUR 1.00 = PHP {phpRate.toFixed(2)}</p>
            ) : (
                <>
                    <p className="font-bold">{currencySymbol === '€' ? 'EUR' : currencySymbol === '$' && answers.studyDestination === 'Australia' ? 'AUD' : (answers.studyDestination === 'Canada' ? 'CAD' : 'NZD')} 1.00 = PHP {phpRate.toFixed(2)}</p>
                </>
            )}
            <p className="italic" style={{ color: 'red' }}>※ The amounts may change due to fluctuations in exchange rates and government or school policies.</p>
        </div>
    );
}
