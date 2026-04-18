
import jsPDF from 'jspdf';
import { drawStyledText } from './styled-text';
import { getPdfImageAddSource, type PdfImageSource } from '../shared/image-source';

const margin = 8;
const didYouKnowText1 = "• We purposely leave the deep-dive research to **YOU**. Why? Because a winning **Statement of Purpose (SOP)** must be **100% genuine**. When you **personally research** your course and campus, your **passion shines through** in your writing—and admissions officers **can tell the difference!**";
const didYouKnowText2 = "• Already have a **visa refusal?** Don’t lose heart. we specialize in **\"The Second Chance.\"** We help students with previous refusals find the **best destinations** and schools that **value their potential** over their past.";

// This helper function calculates the height of styled text without actually drawing it.
const calculateStyledTextHeight = (doc: jsPDF, text: string, maxWidth: number, fontSize: number, lineHeight: number): number => {
    doc.setFontSize(fontSize);
    const segments = text.split(/(\*\*.*?\*\*)/g).filter(part => part);
    let currentX = 0;
    let lineCount = 1;
    segments.forEach(segment => {
        const content = segment.startsWith('**') ? segment.slice(2, -2) : segment;
        const words = content.split(' ');
        words.forEach(word => {
            const wordWidth = doc.getTextWidth(word + ' ');
            if (currentX + wordWidth > maxWidth) {
                currentX = 0;
                lineCount++;
            }
            currentX += doc.getTextWidth(word + ' ');
        });
    });
    return lineCount * lineHeight;
};

// Calculates the total height of the "DID YOU KNOW?" section with a given font size.
export const calculateDidYouKnowHeight = (doc: jsPDF, contentWidth: number, fontSize: number, lineHeight: number): number => {
    let height = 0;
    height += 6; // Top margin for the title

    const text1Height = calculateStyledTextHeight(doc, didYouKnowText1, contentWidth, fontSize, lineHeight);
    height += text1Height + 2; // Text 1 height + padding

    const text2Height = calculateStyledTextHeight(doc, didYouKnowText2, contentWidth, fontSize, lineHeight);
    height += text2Height; // Text 2 height

    return height;
};

// Finds the largest font size that fits within the available space.
export const getOptimalFontSize = (doc: jsPDF, availableSpace: number, contentWidth: number): { fontSize: number; lineHeight: number } => {
    const fontTiers = [
        { size: 9, lineHeight: 4 },
        { size: 8, lineHeight: 3.75 },
        { size: 7, lineHeight: 3.5 },
        { size: 6, lineHeight: 3 },
    ];

    for (const tier of fontTiers) {
        const requiredHeight = calculateDidYouKnowHeight(doc, contentWidth, tier.size, tier.lineHeight);
        if (requiredHeight <= availableSpace) {
            return { fontSize: tier.size, lineHeight: tier.lineHeight };
        }
    }
    
    // Fallback to the smallest size if none fit
    return { fontSize: fontTiers[fontTiers.length - 1].size, lineHeight: fontTiers[fontTiers.length - 1].lineHeight };
};

// Draws the "DID YOU KNOW?" section with a dynamic font size.
export const drawDidYouKnow = (
  doc: jsPDF,
  startY: number,
  fontSize: number,
  lineHeight: number,
  ideaIconImg: PdfImageSource,
) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const availableWidth = pageWidth - (margin * 2);
    const contentWidth = (pageWidth - (margin * 2)) / 2;
    const sectionX = margin + (availableWidth - contentWidth) / 2;
    let currentY = startY;

    // The title font size will also adjust relative to the body font size.
    const titleFontSize = fontSize + 1;
    doc.setFontSize(titleFontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 64, 151); // Use RGB for title

    const titleText = 'DID YOU KNOW?';
    const iconSize = titleFontSize * 0.5; // Scale icon with font
    const iconTextGap = 2;
    const titleWidth = doc.getTextWidth(titleText);
    const totalTitleWidth = titleWidth + iconSize + iconTextGap;
    const titleStartX = sectionX + (contentWidth - totalTitleWidth) / 2;

    doc.text(titleText, titleStartX, currentY, { baseline: 'middle' });
    doc.addImage(
      getPdfImageAddSource(ideaIconImg),
      'PNG',
      titleStartX + titleWidth + iconTextGap,
      currentY - (iconSize / 2),
      iconSize,
      iconSize,
    );
    
    currentY += 6;

    // Use RGB arrays for all colors
    const styleOptions = { defaultColor: [80, 80, 80], boldColor: [0, 64, 151] };

    const text1Height = drawStyledText(doc, didYouKnowText1, sectionX, currentY, contentWidth, fontSize, lineHeight, styleOptions);
    currentY += text1Height + 2;

    drawStyledText(doc, didYouKnowText2, sectionX, currentY, contentWidth, fontSize, lineHeight, styleOptions);
};

