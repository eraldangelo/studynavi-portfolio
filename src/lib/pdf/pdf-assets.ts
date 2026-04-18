'use client';

import { FLAG_URLS, ICON_URLS } from './layouts/main-layout';
import { loadImage, preloadImages } from './pdf-utils';

const MAIN_PDF_ASSET_URLS: ReadonlyArray<string> = [
  ICON_URLS.logo,
  ICON_URLS.disclaimer,
  ICON_URLS.plane,
  ICON_URLS.checkbox,
  ICON_URLS.checked,
  ICON_URLS.document,
  ICON_URLS.warning,
  ICON_URLS.idea,
  ICON_URLS.pay,
  ICON_URLS.bank,
];

export type MainPdfAssets = {
  logoImg: HTMLImageElement;
  disclaimerIconImg: HTMLImageElement;
  destinationFlagImg: HTMLImageElement | null;
  planeIconImg: HTMLImageElement;
  checkboxIconImg: HTMLImageElement;
  checkedIconImg: HTMLImageElement;
  documentIconImg: HTMLImageElement;
  warningIconImg: HTMLImageElement;
  ideaIconImg: HTMLImageElement;
  payIconImg: HTMLImageElement;
  bankIconImg: HTMLImageElement;
};

export type NonGenuinePdfAssets = {
  logoImg: HTMLImageElement;
  disclaimerIconImg: HTMLImageElement;
  warningIconImg: HTMLImageElement;
  destinationFlagImg: HTMLImageElement | null;
  recommendationImg: HTMLImageElement | null;
  bankIconImg: HTMLImageElement | null;
};

const mainAssetPromiseCache = new Map<string, Promise<MainPdfAssets>>();
const nonGenuineAssetPromiseCache = new Map<string, Promise<NonGenuinePdfAssets>>();

function cacheByKey<T>(
  cache: Map<string, Promise<T>>,
  key: string,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = cache.get(key);
  if (cached) return cached;

  const promise = loader().catch((error) => {
    cache.delete(key);
    throw error;
  });
  cache.set(key, promise);
  return promise;
}

export function getDestinationFlagUrl(studyDestination: string | null | undefined): string | null {
  if (!studyDestination) return null;
  return FLAG_URLS[studyDestination] ?? null;
}

export function preloadPdfAssetsForDestination(studyDestination: string | null | undefined) {
  const destinationFlagUrl = getDestinationFlagUrl(studyDestination);
  preloadImages([
    ...MAIN_PDF_ASSET_URLS,
    destinationFlagUrl,
  ]);
}

export async function loadMainPdfAssets(destinationFlagUrl: string | null): Promise<MainPdfAssets> {
  const cacheKey = `main:${destinationFlagUrl ?? 'none'}`;
  return cacheByKey(mainAssetPromiseCache, cacheKey, async () => {
    const logoPromise = loadImage(ICON_URLS.logo);
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
      loadImage(ICON_URLS.disclaimer).catch(() => logoPromise),
      destinationFlagUrl ? loadImage(destinationFlagUrl).catch(() => null) : Promise.resolve(null),
      loadImage(ICON_URLS.plane),
      loadImage(ICON_URLS.checkbox),
      loadImage(ICON_URLS.checked),
      loadImage(ICON_URLS.document),
      loadImage(ICON_URLS.warning).catch(() => logoPromise),
      loadImage(ICON_URLS.idea),
      loadImage(ICON_URLS.pay),
      loadImage(ICON_URLS.bank),
    ]);

    if (
      !logoImg
      || !disclaimerIconImg
      || !planeIconImg
      || !checkboxIconImg
      || !checkedIconImg
      || !documentIconImg
      || !warningIconImg
      || !ideaIconImg
      || !payIconImg
      || !bankIconImg
    ) {
      throw new Error('Core PDF images failed to load.');
    }

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
  });
}

export async function loadNonGenuinePdfAssets(
  destinationFlagUrl: string | null,
): Promise<NonGenuinePdfAssets> {
  const cacheKey = `nongenuine:${destinationFlagUrl ?? 'none'}`;
  return cacheByKey(nonGenuineAssetPromiseCache, cacheKey, async () => {
    const logoPromise = loadImage(ICON_URLS.logo);
    const [logoImg, disclaimerIconImg, warningIconImg, destinationFlagImg, bankIconImg] =
      await Promise.all([
        logoPromise,
        loadImage(ICON_URLS.disclaimer).catch(() => logoPromise),
        loadImage(ICON_URLS.warning).catch(() => logoPromise),
        destinationFlagUrl ? loadImage(destinationFlagUrl).catch(() => null) : Promise.resolve(null),
        loadImage(ICON_URLS.bank).catch(() => null),
      ]);
    const recommendationImg = null;

    if (!logoImg) {
      throw new Error('Core PDF images failed to load.');
    }

    return {
      logoImg,
      disclaimerIconImg,
      warningIconImg,
      destinationFlagImg,
      recommendationImg,
      bankIconImg,
    };
  });
}
