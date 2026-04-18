
import jsPDF from 'jspdf';
import type { Answers } from '../types/pdf-types';
import { getNumber } from '@/services/financials/common';

const formatCurrency = (value: number, symbol: string) => {
    const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${symbol}${formattedValue}`;
};

const formatPhp = (value: number) => {
    const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `(PHP ${formattedValue})`;
}

export const drawExpensesDetails = (doc: jsPDF, answers: Answers, initialY: number, currencySymbol: string, phpRate: number): number => {
    let currentY = initialY;
    const margin = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - margin * 2;
    const rowSpacing = 16;
    const colGap = 4;
    const numCols = 4;
    const colWidth = (contentWidth - (colGap * (numCols - 1))) / numCols;
    const colXPositions = [
        margin,
        margin + colWidth + colGap,
        margin + (colWidth + colGap) * 2,
        margin + (colWidth + colGap) * 3,
    ];

    const drawCell = (doc: jsPDF, label: string, value: any, x: number, y: number, width: number, isCurrency: boolean = false, isIbScore: boolean = false, isRed: boolean = false) => {
        const labelLines = doc.splitTextToSize(label, width);
        const labelHeight = labelLines.length * 3.5;

        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#004097');
        doc.text(labelLines, x, y);

        const valueY = y + labelHeight + 2.5;
        
        if (isCurrency) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            if (isRed) {
              doc.setTextColor(255, 0, 0); // Red
            } else {
              doc.setTextColor(50, 50, 50);
            }
            doc.text(String(value) || 'N/A', x, valueY);
            
            const phpValue = formatPhp(getNumber(String(value).replace(/[^\d.]/g, '')) * phpRate);
            doc.setFontSize(7);
            if (isRed) {
              doc.setTextColor(255, 0, 0); // Red
            } else {
              doc.setTextColor(100, 100, 100);
            }
            doc.text(phpValue, x, valueY + 4);
            return labelHeight + 8;
        } else {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            
            const valueLines = doc.splitTextToSize(String(value) || 'N/A', width);
            doc.text(valueLines, x, valueY);

            let cellHeight = labelHeight + (valueLines.length * 4);

            if (isIbScore) {
                const entryScore = getNumber(value);
                if (entryScore > 0) {
                    const predictedGrade = entryScore + 3;
                    const predictedLabel = 'Predicted Grades:';
                    const predictedY = valueY + (valueLines.length * 4);
                    
                    doc.setFontSize(7);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor('#004097');
                    doc.text(predictedLabel, x, predictedY);

                    doc.setFontSize(9);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(50, 50, 50);
                    doc.text(String(predictedGrade), x + doc.getTextWidth(predictedLabel) + 1, predictedY);
                    
                    cellHeight += 4;
                }
            }
            return cellHeight;
        }
    };
    
    const annualTuitionFee = getNumber(answers.annualTuitionFee);
    const programDuration = getNumber(answers.programDuration, true);
    const totalCourseFee = annualTuitionFee * programDuration;
    
    const scholarshipPercentage = getNumber(answers.scholarshipPercentage);
    const scholarshipAmountRaw = getNumber(answers.scholarshipAmount);
    const hasScholarship = !!answers.scholarshipType && (scholarshipPercentage > 0 || scholarshipAmountRaw > 0);

    const scholarshipDisplayValue = hasScholarship
      ? scholarshipPercentage > 0
        ? `${scholarshipPercentage}%`
        : formatCurrency(scholarshipAmountRaw, currencySymbol)
      : 'N/A';
    
    const totalScholarshipAmount = hasScholarship
      ? scholarshipPercentage > 0
        ? totalCourseFee * (scholarshipPercentage / 100)
        : scholarshipAmountRaw * programDuration
      : 0;

    const annualFeeWithScholarship = annualTuitionFee - (totalScholarshipAmount / programDuration);
    const totalFeeWithScholarship = totalCourseFee - totalScholarshipAmount;

    const showIbScore = answers.highestEducation === 'International Baccalaureate / GCE A-Levels';

    const evidenceOfFundsText = answers.studyDestination === 'Australia'
        ? 'Admissions/Embassy might require'
        : 'Mandatory';

    let englishTestValue = 'N/A';
    if (!showIbScore) {
        let scores = [];
        if (answers.ieltsScore) scores.push(`IELTS: ${answers.ieltsScore}`);
        if (answers.pteScore) scores.push(`PTE: ${answers.pteScore}`);
        if (answers.toeflScore) scores.push(`TOEFL iBT: ${answers.toeflScore}`);
        if (answers.studyDestination === 'Ireland' || answers.studyDestination === 'Canada') {
            if (answers.duolingoScore) scores.push(`Duolingo: ${answers.duolingoScore}`);
        }
        if (scores.length > 0) {
            englishTestValue = scores.join(' | ');
        }
    }


    // --- ROW 1 ---
    const row1Items = [
        { label: 'Annual Course Fee', value: formatCurrency(annualTuitionFee, currencySymbol), isCurrency: true },
        { label: 'Total Course Fee', value: formatCurrency(totalCourseFee, currencySymbol), isCurrency: true },
        { label: 'Evidence of Funds', value: evidenceOfFundsText, isCurrency: false },
        showIbScore
            ? { label: 'IB Entry Score', value: answers.ibEntryScore || 'N/A', isCurrency: false, isIbScore: true }
            : { label: 'English Test Requirements', value: englishTestValue, isCurrency: false }
    ];
    
    row1Items.forEach((item, index) => {
        if (item.label) {
            drawCell(doc, item.label, item.value, colXPositions[index], currentY, colWidth, item.isCurrency, (item as any).isIbScore);
        }
    });

    currentY += rowSpacing;

    // --- ROW 2 (Scholarship and SAT/ACT) ---
    const showSatAct = answers.satActRequired === 'true' && answers.satActScore;
    
    let row2Items: any[] = [];
    if (hasScholarship && showSatAct) {
        row2Items = [
            { label: 'Scholarship', value: scholarshipDisplayValue, isCurrency: false },
            { label: 'Annual Fee w/ Scholarship', value: formatCurrency(annualFeeWithScholarship, currencySymbol), isCurrency: true, isRed: true },
            { label: 'Total Fee w/ Scholarship', value: formatCurrency(totalFeeWithScholarship, currencySymbol), isCurrency: true, isRed: true },
            { label: 'SAT Score Requirement', value: answers.satActScore, isCurrency: false },
        ];
    } else if (hasScholarship) {
        row2Items = [
            { label: 'Scholarship', value: scholarshipDisplayValue, isCurrency: false },
            { label: 'Annual Fee w/ Scholarship', value: formatCurrency(annualFeeWithScholarship, currencySymbol), isCurrency: true, isRed: true },
            { label: 'Total Fee w/ Scholarship', value: formatCurrency(totalFeeWithScholarship, currencySymbol), isCurrency: true, isRed: true },
        ];
    } else if (showSatAct) {
        row2Items = [
            { label: 'SAT Score Requirement', value: answers.satActScore, isCurrency: false },
        ];
    }

    if (row2Items.length > 0) {
        row2Items.forEach((item, index) => {
            if (item.label) {
                drawCell(doc, item.label, item.value, colXPositions[index], currentY, colWidth, item.isCurrency, false, (item as any).isRed);
            }
        });
        currentY += rowSpacing;
    }
    
    return currentY;
};
