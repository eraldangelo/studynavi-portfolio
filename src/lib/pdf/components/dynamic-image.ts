
import jsPDF from 'jspdf';
import {
  getPdfImageAddSource,
  getPdfImageHeight,
  getPdfImageWidth,
  type PdfImageSource,
} from '../shared/image-source';

interface ImagePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const calculateOptimalImageDimensions = (
  image: PdfImageSource,
  maxWidth: number,
  maxHeight: number,
  padding: number = 0
): ImagePosition => {
  const availableWidth = maxWidth - (padding * 2);
  const availableHeight = maxHeight - (padding * 2);
  
  const imageWidth = getPdfImageWidth(image);
  const imageHeight = getPdfImageHeight(image);
  const widthRatio = availableWidth / imageWidth;
  const heightRatio = availableHeight / imageHeight;
  
  const scaleFactor = Math.min(widthRatio, heightRatio);
  
  const scaledWidth = imageWidth * scaleFactor;
  const scaledHeight = imageHeight * scaleFactor;
  
  const x = padding + (availableWidth - scaledWidth) / 2;
  const y = padding + (availableHeight - scaledHeight) / 2;
  
  return { x, y, width: scaledWidth, height: scaledHeight };
};

export const drawDynamicImage = (
  doc: jsPDF,
  image: PdfImageSource,
  startX: number,
  startY: number,
  availableWidth: number,
  availableHeight: number,
  padding: number = 2
): void => {
  if (availableHeight <= 10) return;
  
  const { x, y, width, height } = calculateOptimalImageDimensions(
    image,
    availableWidth,
    availableHeight,
    padding
  );
  
  doc.addImage(getPdfImageAddSource(image), 'PNG', startX + x, startY + y, width, height);
};
