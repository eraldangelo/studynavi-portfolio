import type jsPDF from 'jspdf';

type Rec = {
  recommendedSchool?: string;
  recommendedProgram?: string;
  programDuration?: string;
  englishTestRequirement?: string;
  approximateCost?: string;
};

export function drawFieldsSection(
  doc: jsPDF,
  boxX: number,
  y: number,
  boxW: number,
  rec: Rec,
  constants: {
    labelFont?: string;
    labelFontSize: number;
    valueFontSize: number;
    labelLineHeight: number;
    valueLineHeight: number;
    ROW_GAP: number;
    SECTION_GAP: number;
    PARA_LINE_H: number;
  }
): { y: number; brief?: string } {
  const { labelFont = 'helvetica', labelFontSize, valueFontSize, labelLineHeight, valueLineHeight, ROW_GAP, SECTION_GAP } = constants;
  const innerPad = 6; // left/right inner padding used elsewhere
  const innerContentWidth = boxW - innerPad * 2; // available width for content
  const colGap = 12;
  const colWidth = (innerContentWidth - colGap) / 2;

  const leftX = boxX + innerPad;
  const rightX = leftX + colWidth + colGap;

  // Row 1: Recommended School (left) and Recommended Program (right)
  doc.setFont(labelFont as any, 'bold');
  doc.setFontSize(labelFontSize);
  doc.setTextColor(80, 80, 80);
  doc.text('Recommended School', leftX, y);
  doc.text('Recommended Program', rightX, y);
  y += labelLineHeight;

  doc.setFont(labelFont as any, 'normal');
  doc.setFontSize(valueFontSize);
  doc.setTextColor(50, 50, 50);
  const leftSchoolLines = doc.splitTextToSize(rec.recommendedSchool || 'N/A', colWidth);
  const rightProgramLines = doc.splitTextToSize(rec.recommendedProgram || 'N/A', colWidth);
  doc.text(leftSchoolLines as any, leftX, y, { baseline: 'top' });
  doc.text(rightProgramLines as any, rightX, y, { baseline: 'top' });
  const row1Height = Math.max(leftSchoolLines.length * valueLineHeight, rightProgramLines.length * valueLineHeight);
  y += row1Height + SECTION_GAP;

  // Row 2: Program Duration (left) and English Test requirement (right)
  doc.setFont(labelFont as any, 'bold');
  doc.setFontSize(labelFontSize);
  doc.setTextColor(80, 80, 80);
  doc.text('Program Duration', leftX, y);
  doc.text('English Test requirement', rightX, y);
  y += labelLineHeight;

  doc.setFont(labelFont as any, 'normal');
  doc.setFontSize(valueFontSize);
  doc.setTextColor(50, 50, 50);
  const leftDurationLines = doc.splitTextToSize(rec.programDuration || 'N/A', colWidth);
  const rightEnglishLines = doc.splitTextToSize(rec.englishTestRequirement || 'N/A', colWidth);
  doc.text(leftDurationLines as any, leftX, y, { baseline: 'top' });
  doc.text(rightEnglishLines as any, rightX, y, { baseline: 'top' });
  const row2Height = Math.max(leftDurationLines.length * valueLineHeight, rightEnglishLines.length * valueLineHeight);
  y += row2Height + SECTION_GAP;

  // Row 3: Approximate Cost (full width)
  doc.setFont(labelFont as any, 'bold');
  doc.setFontSize(labelFontSize);
  doc.setTextColor(80, 80, 80);
  doc.text('Approximate Cost', leftX, y);
  y += labelLineHeight;
  doc.setFont(labelFont as any, 'normal');
  doc.setFontSize(valueFontSize);
  doc.setTextColor(50, 50, 50);
  const costLines = doc.splitTextToSize(rec.approximateCost || 'N/A', innerContentWidth);
  doc.text(costLines as any, leftX, y, { baseline: 'top' });
  y += costLines.length * valueLineHeight + SECTION_GAP;

  return { y };
}
