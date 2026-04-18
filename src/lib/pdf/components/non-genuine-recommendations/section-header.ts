import type jsPDF from 'jspdf';
import {
  getPdfImageAddSource,
  getPdfImageHeight,
  getPdfImageWidth,
  type PdfImageSource,
} from '@/lib/pdf/shared/image-source';

export function drawRecommendationHeader(
  doc: jsPDF,
  boxX: number,
  y: number,
  boxW: number,
  idx: number,
  options?: { labelFont?: string; iconImg?: PdfImageSource | null },
): { y: number } {
  const labelFont = options?.labelFont || 'helvetica';
  const sectionHeaderHeight = 6;

  doc.setFont(labelFont as any, 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 64, 151);
  const leftX = boxX + 6;

  const iconImg = options?.iconImg || null;
  let textX = leftX;
  if (iconImg) {
    try {
      const iconW = 4;
      const iconH = iconW * (getPdfImageHeight(iconImg) / getPdfImageWidth(iconImg) || 1);
      const textCenterY = y + 1;
      const iconY = textCenterY - iconH / 2;
      doc.addImage(getPdfImageAddSource(iconImg), 'PNG', leftX, iconY, iconW, iconH);
      textX = leftX + iconW + 2;
    } catch {
      textX = leftX;
    }
  }

  doc.text(`Recommendation ${idx + 1}`, textX, y + 1, { baseline: 'middle' });
  y += sectionHeaderHeight;
  doc.setDrawColor(220, 220, 220);
  doc.line(boxX + 6, y, boxX + boxW - 6, y);
  return { y };
}
