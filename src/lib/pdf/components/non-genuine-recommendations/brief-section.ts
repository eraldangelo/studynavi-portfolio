import type jsPDF from 'jspdf';

export function drawBriefSection(
  doc: jsPDF,
  boxX: number,
  y: number,
  boxW: number,
  briefRaw: string,
  constants: {
    labelFont?: string;
    labelFontSize: number;
    valueFontSize: number;
    PARA_LINE_H: number;
    BOX_PADDING: number;
    SECTION_GAP: number;
  }
): { y: number } {
  const { labelFont = 'helvetica', labelFontSize, valueFontSize, PARA_LINE_H, BOX_PADDING, SECTION_GAP } = constants;

  const brief = (briefRaw || 'N/A')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const briefLines = doc.splitTextToSize(brief, boxW - BOX_PADDING * 2);

  // align label with inner content padding used in fields (match boxX + 6)
  const contentLeft = boxX + 6;
  const innerContentWidth = boxW - 12; // match fields-section inner content width

  doc.setFont(labelFont as any, 'bold');
  doc.setFontSize(labelFontSize);
  doc.setTextColor(80, 80, 80);
  doc.text('Brief Information', contentLeft, y);
  y += 2; // small gap after label

  const boxYforBrief = y;
  // draw justified paragraph directly (no surrounding box)
  doc.setFont(labelFont as any, 'normal');
  doc.setFontSize(valueFontSize);
  doc.setTextColor(50, 50, 50);
  let textY = boxYforBrief;
  for (const line of briefLines as string[]) {
    doc.text(line, contentLeft, textY, { baseline: 'top' });
    textY += PARA_LINE_H;
  }

  const textHeight = briefLines.length * PARA_LINE_H;
  y = boxYforBrief + textHeight + SECTION_GAP;
  return { y };
}
