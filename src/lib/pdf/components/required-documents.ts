
import jsPDF from 'jspdf';
import type { Answers } from '../types/pdf-types';
import { getDocsForEducation } from '@/lib/education/documents';
import { getPdfImageAddSource, type PdfImageSource } from '../shared/image-source';

export const drawRequiredDocuments = (
  doc: jsPDF,
  answers: Answers,
  initialY: number,
  images: {
    documentIconImg: PdfImageSource;
    checkboxIconImg: PdfImageSource;
  }
): number => {
  let currentY = initialY;
  const margin = 8;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header - This is the reference for "Standard Alignment"
  const docHeader = "School Application / Visa Application Required Documents Checklist";
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor('#004097');
  
  const docIconSize = 4;
  const docIconGap = 1.5;
  const docHeaderTextWidth = doc.getTextWidth(docHeader);
  const totalDocHeaderWidth = docHeaderTextWidth + docIconSize + docIconGap;
  let docHeaderStartX = (pageWidth - totalDocHeaderWidth) / 2;
  
  // Correct Alignment Technique:
  // 1. Icon Y is calculated based on the text's middle baseline (currentY)
  // 2. Text is drawn with baseline: 'middle'
  doc.addImage(
    getPdfImageAddSource(images.documentIconImg),
    'PNG',
    docHeaderStartX,
    currentY - (docIconSize / 2),
    docIconSize,
    docIconSize,
  );
  doc.text(docHeader, docHeaderStartX + docIconSize + docIconGap, currentY, { baseline: 'middle', align: 'left' });

  currentY += 8;

  // Instructions - Applying the "Standard Alignment" technique here
  const instructions = [
    "Email all documents in PDF format. They must be in color and high quality.",
    "Do not use a phone camera as an alternative to a scanner.",
    "Documents should be organized and properly labeled.",
    "Unreadable or cropped scans can cause delays in the school or visa application."
  ];

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(255, 0, 0);

  const colWidth = (pageWidth - (margin * 2) - 8) / 2;
  const col2StartX = margin + colWidth + 8;
  const lineHeight = 3.5;
  
  let yPos1 = currentY;
  let yPos2 = currentY;

  instructions.forEach((text, i) => {
    const textLines = doc.splitTextToSize(text, colWidth);
    const itemHeight = textLines.length * lineHeight;
    
    // Determine the starting Y for the current item in the correct column
    let itemY = (i < 2) ? yPos1 : yPos2;
    const itemTextX = (i < 2) ? margin : col2StartX;
    doc.text(textLines, itemTextX, itemY, { baseline: 'top' }); // Draw text from the top to allow wrapping

    // Update the Y position for the next item in the same column
    if (i < 2) {
      yPos1 += itemHeight + 2;
    } else {
      yPos2 += itemHeight + 2;
    }
  });

  currentY = Math.max(yPos1, yPos2) + 4;

  // Document Checklist (No changes needed below this line)
  const allDocuments = getDocsForEducation(answers);
  
  if (allDocuments.length > 0) {
    const docNumColumns = 3;
    const docColumnGap = 8;
    const docTotalContentWidth = pageWidth - (margin * 2);
    const docTotalGapWidth = docColumnGap * (docNumColumns - 1);
    const docColumnWidth = (docTotalContentWidth - docTotalGapWidth) / docNumColumns;
    
    const docCheckboxSize = 3;
    const docCheckboxTextGap = 1;
    
    let columnHeights = new Array(docNumColumns).fill(currentY);

    allDocuments.forEach((docItem, i) => {
        const colIndex = i % docNumColumns;
        const xPos = margin + colIndex * (docColumnWidth + docColumnGap);
        let yPos = columnHeights[colIndex];
        
        const textX = xPos + docCheckboxSize + docCheckboxTextGap;
        const textWidth = docColumnWidth - docCheckboxSize - docCheckboxTextGap;
        
        const labelLines = doc.splitTextToSize(docItem.label, textWidth);
        const subLabelLines = docItem.subLabel ? doc.splitTextToSize(docItem.subLabel, textWidth) : [];
        
        const mainLabelHeight = labelLines.length * 3.5;
        const subLabelHeight = subLabelLines.length > 0 ? (subLabelLines.length * 3) + 0.5 : 0;
        const itemHeight = mainLabelHeight + subLabelHeight + 2; 

        if (yPos + itemHeight > pageHeight - 20) { return; }

        const checkboxY = yPos + (mainLabelHeight / 2) - (docCheckboxSize / 2);
        doc.addImage(
          getPdfImageAddSource(images.checkboxIconImg),
          'PNG',
          xPos,
          checkboxY,
          docCheckboxSize,
          docCheckboxSize,
        );
        
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(labelLines, textX, yPos, { baseline: 'top' });

        if (docItem.subLabel) {
            const subLabelY = yPos + mainLabelHeight - 1;
            doc.setFontSize(7);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text(subLabelLines, textX, subLabelY, { baseline: 'top' });
        }
        
        columnHeights[colIndex] += itemHeight;
    });

    currentY = Math.max(...columnHeights);
  }

  return currentY;
};
