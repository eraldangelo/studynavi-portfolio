import { FLAG_URLS, ICON_URLS } from '../layouts/main-layout';
import type { PdfImageData } from '../shared/image-source';

export type WorkerMainPdfAssets = {
  logoImg: PdfImageData;
  disclaimerIconImg: PdfImageData;
  destinationFlagImg: PdfImageData | null;
  planeIconImg: PdfImageData;
  checkboxIconImg: PdfImageData;
  checkedIconImg: PdfImageData;
  documentIconImg: PdfImageData;
  warningIconImg: PdfImageData;
  ideaIconImg: PdfImageData;
  payIconImg: PdfImageData;
  bankIconImg: PdfImageData;
};

export type WorkerNonGenuinePdfAssets = {
  logoImg: PdfImageData;
  disclaimerIconImg: PdfImageData;
  warningIconImg: PdfImageData;
  destinationFlagImg: PdfImageData | null;
  recommendationImg: PdfImageData | null;
  bankIconImg: PdfImageData | null;
};

function getDestinationFlagUrl(studyDestination: string | null | undefined): string | null {
  if (!studyDestination) return null;
  return FLAG_URLS[studyDestination] ?? null;
}

const workerImageCache = new Map<string, Promise<PdfImageData>>();
const IMAGE_FETCH_TIMEOUT_MS = 20_000;

function resolveWorkerAssetUrl(url: string): string {
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  try {
    return new URL(url, self.location.origin).toString();
  } catch {
    return url;
  }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { cache: 'force-cache', signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function toPdfImageData(url: string): Promise<PdfImageData> {
  const resolvedUrl = resolveWorkerAssetUrl(url);
  const response = await fetchWithTimeout(resolvedUrl);
  if (!response.ok) {
    throw new Error(`Failed to load image: ${response.status} ${response.statusText} (${resolvedUrl})`);
  }
  const blob = await response.blob();
  const mimeType = blob.type || 'image/png';
  const buffer = await blob.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  let width = 1;
  let height = 1;

  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(blob);
      width = bitmap.width || 1;
      height = bitmap.height || 1;
      bitmap.close();
    } catch (error) {
      throw new Error(
        `Failed to decode image asset (${resolvedUrl}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return {
    __pdfData: true,
    src: `data:${mimeType};base64,${base64}`,
    width,
    height,
  };
}

function loadWorkerImage(url: string): Promise<PdfImageData> {
  const cached = workerImageCache.get(url);
  if (cached) return cached;

  const promise = toPdfImageData(url).catch((error) => {
    workerImageCache.delete(url);
    throw error;
  });
  workerImageCache.set(url, promise);
  return promise;
}

async function loadWorkerOptionalImage(url: string): Promise<PdfImageData | null> {
  try {
    return await loadWorkerImage(url);
  } catch {
    return null;
  }
}

export async function loadWorkerMainPdfAssets(studyDestination: string | null | undefined): Promise<WorkerMainPdfAssets> {
  const destinationFlagUrl = getDestinationFlagUrl(studyDestination);
  const logoPromise = loadWorkerImage(ICON_URLS.logo);
  const [
    logoImg,
    disclaimerIconImg,
    destinationFlagImg,
    planeIconImg,
    checkboxIconImg,
    checkedIconImg,
    documentIconImg,
    warningIconImg,
    ideaIconImg,
    payIconImg,
    bankIconImg,
  ] = await Promise.all([
    logoPromise,
    loadWorkerImage(ICON_URLS.disclaimer).catch(() => logoPromise),
    destinationFlagUrl ? loadWorkerOptionalImage(destinationFlagUrl) : Promise.resolve(null),
    loadWorkerImage(ICON_URLS.plane),
    loadWorkerImage(ICON_URLS.checkbox),
    loadWorkerImage(ICON_URLS.checked),
    loadWorkerImage(ICON_URLS.document),
    loadWorkerImage(ICON_URLS.warning).catch(() => logoPromise),
    loadWorkerImage(ICON_URLS.idea),
    loadWorkerImage(ICON_URLS.pay),
    loadWorkerImage(ICON_URLS.bank),
  ]);

  return {
    logoImg,
    disclaimerIconImg,
    destinationFlagImg,
    planeIconImg,
    checkboxIconImg,
    checkedIconImg,
    documentIconImg,
    warningIconImg,
    ideaIconImg,
    payIconImg,
    bankIconImg,
  };
}

export async function loadWorkerNonGenuinePdfAssets(
  studyDestination: string | null | undefined,
): Promise<WorkerNonGenuinePdfAssets> {
  const destinationFlagUrl = getDestinationFlagUrl(studyDestination);
  const logoPromise = loadWorkerImage(ICON_URLS.logo);
  const [logoImg, disclaimerIconImg, warningIconImg, destinationFlagImg, bankIconImg] =
    await Promise.all([
      logoPromise,
      loadWorkerImage(ICON_URLS.disclaimer).catch(() => logoPromise),
      loadWorkerImage(ICON_URLS.warning).catch(() => logoPromise),
      destinationFlagUrl ? loadWorkerOptionalImage(destinationFlagUrl) : Promise.resolve(null),
      loadWorkerOptionalImage(ICON_URLS.bank),
    ]);
  const recommendationImg = null;

  return {
    logoImg,
    disclaimerIconImg,
    warningIconImg,
    destinationFlagImg,
    recommendationImg,
    bankIconImg,
  };
}
