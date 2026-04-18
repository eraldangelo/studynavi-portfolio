import type jsPDF from 'jspdf';

export const CONTACT_TEXT = `Thank you for your interest in studying abroad with StudyNavi. Once you have decided, or your financial sponsor has agreed to support you, please contact our support team:\nGeneral\nsupport@example.com\n+1 555 010 1000\nAdmissions\nadmissions@example.com\n+1 555 010 1001\nDocuments\ndocuments@example.com\n+1 555 010 1002`;

export function drawContactBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  contactText: string,
  options?: {
    boxPadding?: number;
    boxPaddingLeft?: number;
    boxPaddingRight?: number;
    boxPaddingY?: number;
    lineH?: number;
    fontSize?: number;
  }
): number {
  const boxPadding = options?.boxPadding ?? 6;
  const boxPaddingLeft = options?.boxPaddingLeft ?? boxPadding;
  const boxPaddingRight = options?.boxPaddingRight ?? boxPadding;
  const boxPaddingY = options?.boxPaddingY ?? boxPadding;
  const lineH = options?.lineH ?? 4.6;
  const fontSize = options?.fontSize ?? 9;

  const paragraphs = (contactText || '').split('\n');
  const usableWidth = Math.max(10, width - (boxPaddingLeft + boxPaddingRight));
  const wrappedItems: { text: string; noJustify: boolean; isHeading?: boolean; isIntro?: boolean; centerBlock?: boolean }[] = [];

  for (let pi = 0; pi < paragraphs.length; pi++) {
    const p = paragraphs[pi];
    const trimmed = p.replace(/\r/g, '').trim();
    if (!trimmed) {
      wrappedItems.push({ text: '', noJustify: true });
      continue;
    }
    const wrapped = doc.splitTextToSize(trimmed, usableWidth) as string[];
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
    // Determine if this paragraph should NOT be justified:
    // - contains email (@) or phone (+)
    // - ends with a colon (':')
    // - single-word heading (city names)
    const isHeading = wordCount === 1 && !/@|\+/.test(trimmed);
    const noJustify = /@|\+/.test(trimmed) || trimmed.endsWith(':') || isHeading;
    const isIntro = pi === 0; // first paragraph is the intro we want centered
    for (let wi = 0; wi < wrapped.length; wi++) {
      wrappedItems.push({ text: wrapped[wi], noJustify, isHeading: isHeading && wi === 0, isIntro: isIntro });
    }
  }

  // Detect city + email + phone blocks and mark them for center alignment.
  // We expect pattern: single-word heading (city), then an email line, then a phone line.
  for (let i = 0; i < wrappedItems.length; i++) {
    const a = wrappedItems[i];
    if (!a || !a.isHeading) continue;
    const b = wrappedItems[i + 1];
    const c = wrappedItems[i + 2];
    if (!b || !c) continue;
    const isEmail = /@/.test(b.text);
    const isPhone = /\+?\d{3,}|\(\+?\d+\)/.test(c.text);
    if (isEmail && isPhone) {
      a.centerBlock = true;
      b.centerBlock = true;
      c.centerBlock = true;
    }
  }

  const boxH = wrappedItems.length * lineH + boxPaddingY * 2;

  const radius = Math.min(6, Math.min(width, boxH) * 0.06);
  doc.setFillColor(235, 245, 255);
  doc.setDrawColor(200, 220, 240);
  if (typeof (doc as any).roundedRect === 'function') {
    (doc as any).roundedRect(x, y, width, boxH, radius, radius, 'F');
    doc.setDrawColor(180, 200, 220);
    (doc as any).roundedRect(x, y, width, boxH, radius, radius);
  } else {
    doc.rect(x, y, width, boxH, 'F');
    doc.setDrawColor(180, 200, 220);
    doc.rect(x, y, width, boxH);
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(40, 40, 40);

  const startX = x + boxPaddingLeft;
  const startY = y + boxPaddingY;
  for (let i = 0; i < wrappedItems.length; i++) {
    const item = wrappedItems[i];
    const lineY = startY + i * lineH;
    const isLastLine = i === wrappedItems.length - 1;

    // Heading lines should be bold blue; intro lines should be centered
    if (item.isHeading) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 64, 151);
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
    }

    // Center intro paragraph lines
    if (item.isIntro) {
      doc.text(item.text, startX + usableWidth / 2, lineY, { align: 'center', baseline: 'top' });
      continue;
    }

    // Center city/email/phone blocks
    if (item.centerBlock) {
      doc.text(item.text, startX + usableWidth / 2, lineY, { align: 'center', baseline: 'top' });
      continue;
    }

    if (item.noJustify || isLastLine || item.text === '') {
      doc.text(item.text, startX, lineY, { baseline: 'top' });
      continue;
    }

    const words = item.text.split(/\s+/).filter(Boolean);
    if (words.length <= 1) {
      doc.text(item.text, startX, lineY, { baseline: 'top' });
      continue;
    }
    const wordsWidth = words.reduce((s, w) => s + doc.getTextWidth(w), 0);
    const gapCount = words.length - 1;
    const remaining = Math.max(0, usableWidth - wordsWidth);
    const gap = remaining / gapCount;
    let cx = startX;
    for (let wi = 0; wi < words.length; wi++) {
      const w = words[wi];
      doc.text(w, cx, lineY, { baseline: 'top' });
      cx += doc.getTextWidth(w) + gap;
    }
  }

  return boxH;
}
