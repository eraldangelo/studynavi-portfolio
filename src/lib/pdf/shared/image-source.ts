export type PdfImageData = {
  __pdfData: true;
  src: string;
  width: number;
  height: number;
};

export type PdfImageSource = HTMLImageElement | PdfImageData;

function isPdfImageData(image: PdfImageSource): image is PdfImageData {
  return (image as PdfImageData).__pdfData === true;
}

export function getPdfImageWidth(image: PdfImageSource): number {
  return isPdfImageData(image) ? image.width : image.width;
}

export function getPdfImageHeight(image: PdfImageSource): number {
  return isPdfImageData(image) ? image.height : image.height;
}

export function getPdfImageAddSource(image: PdfImageSource): string | HTMLImageElement {
  return isPdfImageData(image) ? image.src : image;
}
