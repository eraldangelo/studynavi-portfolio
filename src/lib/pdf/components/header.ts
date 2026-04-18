
import jsPDF from 'jspdf';
import {
  getPdfImageAddSource,
  getPdfImageHeight,
  getPdfImageWidth,
  type PdfImageSource,
} from '../shared/image-source';

type DrawHeaderOptions = {
  showDisclaimerIcon?: boolean;
};

export const drawHeader = (
  doc: jsPDF,
  logoImg: PdfImageSource,
  disclaimerIconImg: PdfImageSource,
  options: DrawHeaderOptions = {},
) => {
    const showDisclaimerIcon = options.showDisclaimerIcon ?? true;
    const margin = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const headerHeight = 10;
    const headerY = margin;

    // Left side: render only the brand image (no appended text).
    let logoHeight = 8;
    let logoWidth = (getPdfImageWidth(logoImg) * logoHeight) / getPdfImageHeight(logoImg);
    const maxLogoWidth = 34;
    if (logoWidth > maxLogoWidth) {
      const scale = maxLogoWidth / logoWidth;
      logoWidth = maxLogoWidth;
      logoHeight *= scale;
    }
    const x = margin + 2;
    const y = headerY + (headerHeight - logoHeight) / 2 - 0.2;
    doc.addImage(getPdfImageAddSource(logoImg), 'PNG', x, y, logoWidth, logoHeight);

    // Right Side: Disclaimer Icon and Text
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(255, 0, 0);

    const disclaimerText1 = "The amounts may change due to fluctuations in exchange rates";
    const disclaimerText2 = "and government or school policies";
    const disclaimerTextWidth = Math.max(doc.getTextWidth(disclaimerText1), doc.getTextWidth(disclaimerText2));
    
    const iconSize = 4;
    const iconTextGap = 1;
    
    const totalContentWidth = showDisclaimerIcon
      ? iconSize + iconTextGap + disclaimerTextWidth
      : disclaimerTextWidth;
    const rightEdge = pageWidth - margin - 2;
    const contentStartX = rightEdge - totalContentWidth;

    let disclaimerTextX = contentStartX;
    if (showDisclaimerIcon) {
      const iconX = contentStartX;
      const iconY = headerY + (headerHeight / 2) - (iconSize / 2) - 0.2;
      doc.addImage(getPdfImageAddSource(disclaimerIconImg), 'PNG', iconX, iconY, iconSize, iconSize);
      disclaimerTextX = iconX + iconSize + iconTextGap;
    }
    const disclaimerY1 = headerY + (headerHeight / 2) - 1;
    const disclaimerY2 = headerY + (headerHeight / 2) + 1.5;
    
    doc.text(disclaimerText1, disclaimerTextX, disclaimerY1, { align: 'left' });
    doc.text(disclaimerText2, disclaimerTextX, disclaimerY2, { align: 'left' });
};
