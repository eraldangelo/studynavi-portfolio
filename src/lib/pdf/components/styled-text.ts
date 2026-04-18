
import jsPDF from 'jspdf';

interface StyleOptions {
    defaultColor?: number[]; // Only RGB arrays
    boldColor?: number[];    // Only RGB arrays
}

export const drawStyledText = (
    doc: jsPDF, 
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    fontSize: number, 
    lineHeight: number,
    options: StyleOptions = {}
) => {
    const { defaultColor = [80, 80, 80], boldColor = [0, 64, 151] } = options;
    
    // Save original state
    const originalFont = doc.getFont();
    const originalFontSize = doc.getFontSize();
    const originalTextColor = doc.getTextColor();
    
    doc.setFontSize(fontSize);
    
    const segments = text.split(/(\*\*.*?\*\*)/g).filter(part => part);

    let currentX = x;
    let currentY = y;
    let lineCount = 1;

    segments.forEach(segment => {
        const isBold = segment.startsWith('**') && segment.endsWith('**');
        const content = isBold ? segment.slice(2, -2) : segment;
        
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        
        // Set color using RGB array
        if (isBold) {
            doc.setTextColor(boldColor[0], boldColor[1], boldColor[2]);
        } else {
            doc.setTextColor(defaultColor[0], defaultColor[1], defaultColor[2]);
        }

        const words = content.split(' ');
        words.forEach(word => {
            const wordWidth = doc.getTextWidth(word + ' ');
            if (currentX + wordWidth > x + maxWidth) {
                currentX = x;
                currentY += lineHeight;
                lineCount++;
            }
            doc.text(word, currentX, currentY);
            currentX += doc.getTextWidth(word + ' ');
        });
    });
    
    // Restore original state
    doc.setFont(originalFont.fontName, originalFont.fontStyle);
    doc.setFontSize(originalFontSize);
    doc.setTextColor(originalTextColor);

    return lineCount * lineHeight;
};
