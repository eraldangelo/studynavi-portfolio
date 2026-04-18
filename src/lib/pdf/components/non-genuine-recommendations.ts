import type jsPDF from 'jspdf';
import { drawHeader } from '../components/header';
import type { Answers } from '../types/pdf-types';
import { drawRecommendationHeader } from './non-genuine-recommendations/section-header';
import { drawFieldsSection } from './non-genuine-recommendations/fields-section';
import { drawBriefSection } from './non-genuine-recommendations/brief-section';
import { drawContactBox, CONTACT_TEXT } from './non-genuine-recommendations/contact-box.clean';
import {
  getPdfImageAddSource,
  getPdfImageHeight,
  getPdfImageWidth,
  type PdfImageSource,
} from '@/lib/pdf/shared/image-source';

type DrawOptions = {
  pageWidth: number;
  pageHeight: number;
  margin: number;
  contentMaxY: number;
  separatorY: number;
  logoImg?: PdfImageSource | null;
  disclaimerIconImg?: PdfImageSource | null;
  destinationFlagImg?: PdfImageSource | null;
  recommendationImg?: PdfImageSource | null;
  iconImg?: PdfImageSource | null;
  title?: string;
};

export function drawNonGenuineRecommendations(
  doc: jsPDF,
  answers: Answers,
  startY: number,
  options: DrawOptions,
): { currentY: number; didPaginate: boolean } {
  const {
    pageWidth,
    pageHeight,
    margin,
    contentMaxY,
    separatorY,
    logoImg,
    disclaimerIconImg,
    destinationFlagImg,
    iconImg,
  } = options;

  const recs =
    answers.nonGenuineRecommendations && Array.isArray(answers.nonGenuineRecommendations) && answers.nonGenuineRecommendations.length > 0
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

  const contentWidth = pageWidth - margin * 2;
  const labelFont = 'helvetica';
  let currentY = startY + 8;
  let didPaginate = false;

  const startNewPage = () => {
    doc.addPage();
    if (logoImg && disclaimerIconImg) {
      drawHeader(doc as any, logoImg, disclaimerIconImg, { showDisclaimerIcon: false });
    }
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, separatorY, pageWidth - margin, separatorY);
    if (options.title) {
      doc.setFont(labelFont as any, 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 64, 151);
      let currentX = (pageWidth - doc.getTextWidth(options.title)) / 2;
      if (destinationFlagImg) {
        const flagSize = 6;
        const flagHeight = flagSize * (getPdfImageHeight(destinationFlagImg) / getPdfImageWidth(destinationFlagImg));
        const flagY = currentY - flagHeight / 2 + 0.1;
        doc.addImage(getPdfImageAddSource(destinationFlagImg), 'PNG', currentX, flagY, flagSize, flagHeight);
        currentX += flagSize + 1.5;
      }
      doc.text(options.title || '', currentX, separatorY + 10, { align: 'left', baseline: 'middle' });
    }
    currentY = separatorY + 16;
    didPaginate = true;
  };

  recs.forEach((rec, idx) => {
    const SECTION_GAP = 4;
    const ROW_GAP = 2;
    const LABEL_TO_VALUE_GAP = 2;
    const PARA_LINE_H = 5;
    const FIELD_LINE_H = 3.8;
    const BOX_PADDING = 4;
    const cardPadding = 4;

    const boxX = margin;
    const boxY = currentY;
    const boxW = contentWidth;

    const headerRes = drawRecommendationHeader(doc, boxX, currentY, boxW, idx, { labelFont, iconImg });
    let y = headerRes.y + SECTION_GAP;
    const constants = {
      labelFont,
      labelFontSize: 9,
      valueFontSize: 9,
      labelLineHeight: LABEL_TO_VALUE_GAP,
      valueLineHeight: FIELD_LINE_H,
      ROW_GAP,
      SECTION_GAP,
      PARA_LINE_H,
      BOX_PADDING,
    } as const;

    y = drawFieldsSection(doc, boxX, y, boxW, rec as any, constants as any).y;
    y = drawBriefSection(doc, boxX, y, boxW, (rec as any).briefInfo || '', constants as any).y;
    currentY = boxY + (y - boxY) + cardPadding;

    if (currentY + 10 > contentMaxY) startNewPage();
  });

  const innerLeft = margin + 10;
  const innerRight = pageWidth - margin - 10;
  let footerRowY = currentY + 4;
  const maxRowHeight = contentMaxY - footerRowY;
  if (maxRowHeight <= 0) return { currentY, didPaginate };

  const maxBoxWidth = 105;
  let boxW = Math.min(maxBoxWidth, innerRight - innerLeft);
  const boxX = innerLeft + ((innerRight - innerLeft - boxW) / 2);

  let boxPadding = 4;
  let boxPaddingLeft = 4;
  let boxPaddingRight = 2;
  let boxPaddingY = 4.5;
  let fontSize = 8.5;
  let lineH = 4.2;

  const paragraphsForCalc = CONTACT_TEXT.split('\n');
  let wrappedCount = 0;
  for (const p of paragraphsForCalc) {
    wrappedCount += doc.splitTextToSize(p.replace(/\r/g, ''), boxW - (boxPaddingLeft + boxPaddingRight)).length;
  }
  let boxH = wrappedCount * lineH + boxPaddingY * 2;

  while (boxH > maxRowHeight && fontSize > 6.5) {
    fontSize = Math.max(6.5, fontSize - 0.5);
    lineH = Math.max(3.0, lineH - 0.35);
    boxPadding = Math.max(2.5, boxPadding - 0.5);
    boxPaddingLeft = Math.max(3, boxPaddingLeft - 0.4);
    boxPaddingRight = Math.max(1, boxPaddingRight - 0.2);
    boxPaddingY = Math.max(3, boxPaddingY - 0.35);

    wrappedCount = 0;
    for (const p of paragraphsForCalc) {
      wrappedCount += doc.splitTextToSize(p.replace(/\r/g, ''), boxW - (boxPaddingLeft + boxPaddingRight)).length;
    }
    boxH = wrappedCount * lineH + boxPaddingY * 2;
  }

  const drawnH = drawContactBox(doc, boxX, footerRowY, boxW, CONTACT_TEXT, {
    boxPadding,
    boxPaddingLeft,
    boxPaddingRight,
    boxPaddingY,
    lineH,
    fontSize,
  });
  footerRowY += drawnH + 6;
  currentY = footerRowY;

  return { currentY, didPaginate };
}
