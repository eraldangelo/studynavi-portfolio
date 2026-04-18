
import jsPDF from 'jspdf';

export const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number, generatedDate: string, currencyCode: string, phpRate: number) => {
    const margin = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 12;

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);

    const footerTextY = footerY;
    const footerTextY2 = footerY + 2.5;
    
    const startX = margin + 2;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#eab308');
    doc.text('Generated on:', startX, footerTextY, { baseline: 'middle' });
    const genOnTextWidth = doc.getTextWidth('Generated on:');
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#004097');
    doc.text(generatedDate, startX + genOnTextWidth + 1, footerTextY, { baseline: 'middle' });

    // Exchange Rate
    const oneText = '1.00';
    const equalsText = '= ';
    const phpText = 'PHP';
    const rateText = `${phpRate.toFixed(2)}`;

    let currentX = startX;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#eab308');
    doc.text(currencyCode, currentX, footerTextY2, { baseline: 'middle' });
    currentX += doc.getTextWidth(currencyCode);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#004097');
    doc.text(` ${oneText}`, currentX, footerTextY2, { baseline: 'middle' });
    currentX += doc.getTextWidth(` ${oneText}`);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(` ${equalsText} `, currentX, footerTextY2, { baseline: 'middle' });
    currentX += doc.getTextWidth(` ${equalsText} `);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#eab308');
    doc.text(phpText, currentX, footerTextY2, { baseline: 'middle' });
    currentX += doc.getTextWidth(phpText);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#004097');
    doc.text(` ${rateText}`, currentX, footerTextY2, { baseline: 'middle' });


    const pageLabel = 'Page';
    const pageNumbers = `${pageNum}/${totalPages}`;
    const rightEdge = pageWidth - margin - 2;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#004097');
    const numbersWidth = doc.getTextWidth(pageNumbers);
    doc.text(pageNumbers, rightEdge, footerTextY, { align: 'right', baseline: 'middle' });

    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#eab308');
    const labelX = rightEdge - numbersWidth;
    doc.text(pageLabel, labelX, footerTextY, { align: 'right', baseline: 'middle' });
};
