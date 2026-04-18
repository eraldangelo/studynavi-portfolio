
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import type { Answers } from '../types/pdf-types';

export const drawProgramDetails = (doc: jsPDF, answers: Answers, initialY: number): number => {
  let currentY = initialY;
  const margin = 8;
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(8);
  
  const infoContentWidth = pageWidth - (margin * 2);
  
  // Calculate column widths based on the 3.5:3.5:1.5 ratio
  const totalRatio = 3.5 + 3.5 + 1.5; // = 8.5
  const col1Width = (infoContentWidth / totalRatio) * 3.5;
  const col2Width = (infoContentWidth / totalRatio) * 3.5;
  const col3Width = (infoContentWidth / totalRatio) * 1.5;

  const drawCell = (label: string, value: string, x: number, y: number, maxWidth: number) => {
      const labelWidth = doc.getTextWidth(label) + 1.5; // Added a bit more space
      const valueMaxWidth = maxWidth - labelWidth - 1;
      const valueLines = doc.splitTextToSize(value || 'N/A', valueMaxWidth);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#004097');
      doc.text(label, x, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(valueLines, x + labelWidth, y);
      
      // Return the height this cell occupies
      return valueLines.length * 3.5;
  };
  
  const formattedIntakeDate = answers.intakeYear && answers.intakeMonth
      ? format(new Date(Number(answers.intakeYear), Number(answers.intakeMonth) - 1), 'MMM yyyy')
      : 'N/A';

  const row1Data = [
    { label: 'Destination:', value: answers.studyDestination || 'N/A', width: col1Width },
    { label: 'School:', value: answers.schoolName || 'N/A', width: col2Width },
    { label: 'Campus:', value: answers.campusLocation || 'N/A', width: col3Width },
  ];
  
  const row2Data = [
    { label: 'Program Type:', value: answers.programCategory || 'N/A', width: col1Width },
    { label: 'Course:', value: answers.program || 'N/A', width: col2Width },
    { label: 'Intake:', value: formattedIntakeDate, width: col3Width },
  ];
  
  let row1MaxHeight = 0;
  let currentX = margin;
  row1Data.forEach((item) => {
    const height = drawCell(item.label, item.value, currentX, currentY, item.width);
    if (height > row1MaxHeight) {
      row1MaxHeight = height;
    }
    currentX += item.width;
  });

  currentY += row1MaxHeight + 1.5; // Add vertical spacing between rows

  let row2MaxHeight = 0;
  currentX = margin;
  row2Data.forEach((item) => {
    const height = drawCell(item.label, item.value, currentX, currentY, item.width);
    if (height > row2MaxHeight) {
      row2MaxHeight = height;
    }
    currentX += item.width;
  });

  currentY += row2MaxHeight + 5; // Add final padding below the block

  return currentY;
};
