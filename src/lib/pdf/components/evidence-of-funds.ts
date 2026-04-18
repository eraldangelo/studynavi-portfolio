
import jsPDF from 'jspdf';
import type { Answers, FinancialDocumentCalculationResult } from '../types/pdf-types';
import { getCurrencyInfo } from '@/lib/currency';
import { getPdfImageAddSource, type PdfImageSource } from '../shared/image-source';

const formatCurrency = (value: number | undefined, symbol: string) => {
    if (value === undefined || value === 0) return `${symbol}0.00`;
    const formattedValue = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${symbol}${formattedValue}`;
};

const formatPhp = (value: number | undefined) => {
    if (value === undefined || value === 0) return '(PHP 0.00)';
    const formattedValue = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `(PHP ${formattedValue})`;
}

const drawRow = (
    doc: jsPDF, 
    y: number, 
    label: string, 
    value: number, 
    startX: number,
    columnWidth: number,
    currencySymbol: string, 
    phpRate: number,
    isTotal: boolean = false,
    subLabel?: string,
) => {
    const valueColumnX = startX + columnWidth;
    let labelY = y;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 64, 151);
    
    doc.text(label, startX + 2, labelY, { baseline: 'middle' });

    if (subLabel) {
        const studyDest = (doc as any).hotspot?.metadata?.answers?.studyDestination ?? '';
        const isCanadaOrIreland = ['Canada', 'Ireland'].includes(studyDest);
        if (!(isCanadaOrIreland && label === 'Cost of Living' && value === 0)) {
            doc.setFontSize(6);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text(subLabel, startX + 2, labelY + 3, { baseline: 'middle'});
        }
    }

    doc.setFontSize(isTotal ? 11 : 9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(isTotal ? 0 : 80, isTotal ? 64 : 80, isTotal ? 151 : 80);
    
    const textValue = formatCurrency(value, currencySymbol);
    doc.text(textValue, valueColumnX - 2, y, { align: 'right', baseline: 'middle' });

    doc.setFontSize(isTotal ? 8 : 7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(isTotal ? 0 : 80, isTotal ? 64 : 80, isTotal ? 151 : 80);
    const phpValue = formatPhp(value !== undefined ? value * phpRate : undefined);
    doc.text(phpValue, valueColumnX - 2, y + (isTotal ? 4 : 3.5), { align: 'right', baseline: 'middle' });
    
    let rowHeight = isTotal ? 12 : 8;
    if (subLabel) rowHeight += 2;

    return rowHeight;
};

const drawDocumentList = (
  doc: jsPDF,
  startX: number,
  startY: number,
  width: number,
  answers: Answers,
  images: { checkboxIconImg: PdfImageSource },
) => {
    let y = startY;
    const isCanada = answers.studyDestination === 'Canada';
    const isIreland = answers.studyDestination === 'Ireland';
    const isNewZealand = answers.studyDestination === 'New Zealand';

    const documents = [
        'Bank Certificate',
        `Bank Statement (${isIreland || isCanada || isNewZealand ? '6' : '3'} months history)`,
        'Affidavit of Support / Statutory Declaration',
        'Proof of relationship to the sponsor',
        '2 valid IDs of the sponsor',
        'Proof of Ongoing Income'
    ];
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const checkboxSize = 3;
    const textStartX = startX + checkboxSize + 1; // Gap between checkbox and text
    const textWidth = width - checkboxSize - 1;
    const lineHeight = 3.5;

    documents.forEach(docText => {
        const lines = doc.splitTextToSize(docText, textWidth);
        const itemHeight = lines.length * lineHeight;

        const textBaselineY = y + (lineHeight / 2); // Center of the first line
        const checkboxY = textBaselineY - (checkboxSize / 2);
        doc.addImage(
          getPdfImageAddSource(images.checkboxIconImg),
          'PNG',
          startX,
          checkboxY,
          checkboxSize,
          checkboxSize,
        );

        doc.text(lines, textStartX, y, { baseline: 'top' }); // Draw text from top
        y += itemHeight + 1.5; // Move to next item position
    });

    return y;
};


export const drawEvidenceOfFunds = (
    doc: jsPDF,
    answers: Answers,
    financialDocuments: FinancialDocumentCalculationResult | null,
    exchangeRates: any,
    initialY: number,
    images: {
        checkboxIconImg: PdfImageSource;
        documentIconImg: PdfImageSource;
        bankIconImg: PdfImageSource;
    }
): number => {
    let currentY = initialY;
    const margin = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const columnGap = 10;
    const colWidth = (pageWidth - (margin * 2) - columnGap) / 2;
    const col1X = margin;
    const col2X = margin + colWidth + columnGap;

    if (!financialDocuments || !exchangeRates) {
        doc.text("Financial evidence details could not be calculated.", col1X, currentY);
        return currentY + 10;
    }

    // Pass answers to doc for use in drawRow sublabel condition
    (doc as any).hotspot = { metadata: { answers } };

    const { currencySymbol, phpRate } = getCurrencyInfo(answers.studyDestination, exchangeRates);
    const { oneYearTuitionFee, costOfLiving, partnerCostOfLiving, dependentCostOfLiving, nzSchoolAgeCost, nzNonSchoolAgeCost, airfare, totalFunds } = financialDocuments;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 64, 151);

    // Column 2 Header
    const docHeaderText = "Evidence of Funds Document Checklist";
    const docIconSize = 4;
    const docIconGap = 1.5;
    const docHeaderTextWidth = doc.getTextWidth(docHeaderText);
    const totalDocHeaderWidth = docHeaderTextWidth + docIconSize + docIconGap;
    const docHeaderStartX = col2X + (colWidth - totalDocHeaderWidth) / 2;
    
    // Column 1 Header
    const eofHeaderText = "Evidence Of Funds";
    const eofIconSize = 4;
    const eofIconGap = 1.5;
    const eofHeaderTextWidth = doc.getTextWidth(eofHeaderText);
    const totalEofHeaderWidth = eofHeaderTextWidth + eofIconSize + eofIconGap;
    const eofHeaderStartX = col1X + (colWidth - totalEofHeaderWidth) / 2;

    doc.addImage(
      getPdfImageAddSource(images.bankIconImg),
      'PNG',
      eofHeaderStartX,
      currentY - (eofIconSize / 2),
      eofIconSize,
      eofIconSize,
    );
    doc.text(eofHeaderText, eofHeaderStartX + eofIconSize + eofIconGap, currentY, { baseline: 'middle', align: 'left' });

    doc.addImage(
      getPdfImageAddSource(images.documentIconImg),
      'PNG',
      docHeaderStartX,
      currentY - (docIconSize / 2),
      docIconSize,
      docIconSize,
    );
    doc.text(docHeaderText, docHeaderStartX + docIconSize + docIconGap, currentY, { baseline: 'middle', align: 'left' });


    currentY += 3.5;
    doc.setDrawColor(220, 220, 220);
    doc.line(col1X, currentY, col1X + colWidth, currentY);
    doc.line(col2X, currentY, col2X + colWidth, currentY);
    currentY += 4;

    let col1Y = currentY;
    let col2Y = currentY;

    col2Y = drawDocumentList(doc, col2X, col2Y, colWidth, answers, images);

    if (oneYearTuitionFee > 0) {
        col1Y += drawRow(doc, col1Y, '1 Year Tuition Fee', oneYearTuitionFee, col1X, colWidth, currencySymbol, phpRate);
    }
    
    let costOfLivingSubLabel: string | undefined;
    if (answers.studyDestination === 'Australia') {
      costOfLivingSubLabel = '(Student)';
    } else if (answers.studyDestination === 'New Zealand') {
      costOfLivingSubLabel = `(${currencySymbol}20,000/year)`;
    } else if (answers.studyDestination !== 'Canada' && answers.studyDestination !== 'Ireland' && costOfLiving > 0) {
      costOfLivingSubLabel = `(${currencySymbol}${costOfLiving.toLocaleString()}/year)`;
    }
    
    col1Y += drawRow(doc, col1Y, 'Cost of Living', costOfLiving, col1X, colWidth, currencySymbol, phpRate, false, costOfLivingSubLabel);
    
    if (partnerCostOfLiving > 0) {
        col1Y += drawRow(doc, col1Y, 'Cost of Living', partnerCostOfLiving, col1X, colWidth, currencySymbol, phpRate, false, `(Partner)`);
    }
    if (dependentCostOfLiving > 0) {
        col1Y += drawRow(doc, col1Y, 'Cost of Living', dependentCostOfLiving, col1X, colWidth, currencySymbol, phpRate, false, `(Dependent)`);
    }
    if (nzSchoolAgeCost > 0) {
        col1Y += drawRow(doc, col1Y, 'Cost of Living (School Age)', nzSchoolAgeCost, col1X, colWidth, currencySymbol, phpRate, false, `(${currencySymbol}17,000/person)`);
    }
    if (nzNonSchoolAgeCost > 0) {
        col1Y += drawRow(doc, col1Y, 'Cost of Living (Non-School)', nzNonSchoolAgeCost, col1X, colWidth, currencySymbol, phpRate, false, `(${currencySymbol}4,200/person)`);
    }
    if (airfare > 0) {
        col1Y += drawRow(doc, col1Y, 'Airfare (Round Trip)', airfare, col1X, colWidth, currencySymbol, phpRate, false, `(${currencySymbol}${answers.studyDestination === 'New Zealand' ? '2,500' : '2,000'}/person)`);
    }

    col1Y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(col1X, col1Y, col1X + colWidth, col1Y);
    col1Y += 2;
    
    col1Y += drawRow(doc, col1Y, "Total Funds in the bank", totalFunds, col1X, colWidth, currencySymbol, phpRate, true);

    return Math.max(col1Y, col2Y);
};
