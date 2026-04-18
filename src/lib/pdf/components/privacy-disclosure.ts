
import jsPDF from 'jspdf';
import { getPdfImageAddSource, type PdfImageSource } from '../shared/image-source';

const margin = 8;

// Draws the "Privacy Disclosure" section, positioned from the bottom of the page.
export const drawPrivacyDisclosure = (doc: jsPDF, warningIconImg: PdfImageSource) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const blueBoxHeight = 18;
    const gapAboveFooter = 6;
    const footerSeparatorY = pageHeight - 12 - 4;
    
    const blueBoxY = footerSeparatorY - gapAboveFooter - blueBoxHeight;
    const blueBoxWidth = pageWidth - (margin * 2);
    
    doc.setFillColor(239, 246, 255);
    doc.setDrawColor(219, 234, 254);
    doc.roundedRect(margin, blueBoxY, blueBoxWidth, blueBoxHeight, 3, 3, 'FD');
    
    let blueBoxContentY = blueBoxY + 3;
    
    const titleText = "Privacy Disclosure";
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const titleWidth = doc.getTextWidth(titleText);
    
    const iconSize = 3;
    const iconGap = 1.5;
    const totalTitleWidth = iconSize + iconGap + titleWidth;
    let titleStartX = margin + (blueBoxWidth - totalTitleWidth) / 2;
    
    doc.addImage(
      getPdfImageAddSource(warningIconImg),
      'PNG',
      titleStartX,
      blueBoxContentY - (iconSize / 2),
      iconSize,
      iconSize,
    );
    
    doc.setTextColor(0, 64, 151); // Use RGB for title
    doc.text(titleText, titleStartX + iconSize + iconGap, blueBoxContentY, { baseline: 'middle' });
    
    blueBoxContentY += 5.5;
    
    const bodyText = "This document is intended only for the student and authorized recipients. It contains confidential information and should not be shared, published, or distributed without permission. Please handle all personal data in accordance with applicable privacy and data-protection laws.";
    const bodyPadding = 4;
    const bodyTextWidth = blueBoxWidth - (bodyPadding * 2);
    const bodyStartX = margin + bodyPadding;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    doc.text(bodyText, bodyStartX, blueBoxContentY, {
        align: 'justify',
        maxWidth: bodyTextWidth,
    });
};
