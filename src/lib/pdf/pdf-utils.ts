'use client';

import jsPDF from 'jspdf';
import {
  getPdfImageAddSource,
  getPdfImageHeight,
  getPdfImageWidth,
  type PdfImageSource,
} from './shared/image-source';

export const PDF_MARGIN = 8;
export const PDF_SEPARATOR_Y = 18;
export const FLAG_SIZE = 6;
export const FLAG_TEXT_GAP = 1.5;
const IMAGE_LOAD_TIMEOUT_MS = 20_000;

const imagePromiseCache = new Map<string, Promise<HTMLImageElement>>();

function createImageLoadPromise(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let settled = false;

    const clearHandlers = () => {
      img.onload = null;
      img.onerror = null;
    };

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      clearHandlers();
      reject(new Error(`Image load timed out after ${IMAGE_LOAD_TIMEOUT_MS}ms: ${url}`));
    }, IMAGE_LOAD_TIMEOUT_MS);

    img.crossOrigin = 'Anonymous';
    img.decoding = 'async';
    img.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      clearHandlers();
      resolve(img);
    };
    img.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      clearHandlers();
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  const cachedPromise = imagePromiseCache.get(url);
  if (cachedPromise) {
    return cachedPromise;
  }

  const loadingPromise = createImageLoadPromise(url).catch((error) => {
    imagePromiseCache.delete(url);
    throw error;
  });

  imagePromiseCache.set(url, loadingPromise);
  return loadingPromise;
};

export function preloadImages(urls: ReadonlyArray<string | null | undefined>) {
  urls.forEach((url) => {
    if (!url) return;
    loadImage(url).catch(() => {
      // Preload is best-effort: runtime generation path still handles failures.
    });
  });
}

export function drawCenteredTitleWithFlag(params: {
  doc: jsPDF;
  text: string;
  y: number;
  pageWidth: number;
  flagImg: PdfImageSource | null;
  fontSize?: number;
  color?: [number, number, number];
}) {
  const {
    doc,
    text,
    y,
    pageWidth,
    flagImg,
    fontSize = 14,
    color = [0, 64, 151],
  } = params;

  doc.setFontSize(fontSize);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(color[0], color[1], color[2]);

  const textWidth = doc.getTextWidth(text);
  let totalContentWidth = textWidth;
  if (flagImg) totalContentWidth += FLAG_SIZE + FLAG_TEXT_GAP;

  let currentX = (pageWidth - totalContentWidth) / 2;
  if (flagImg) {
    const flagHeight = FLAG_SIZE * (getPdfImageHeight(flagImg) / getPdfImageWidth(flagImg));
    const flagY = y - (flagHeight / 2) + 0.1;
    doc.addImage(getPdfImageAddSource(flagImg), 'PNG', currentX, flagY, FLAG_SIZE, flagHeight);
    currentX += FLAG_SIZE + FLAG_TEXT_GAP;
  }

  doc.text(text, currentX, y, { align: 'left', baseline: 'middle' });
}
