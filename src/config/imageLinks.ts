const DEFAULT_STORAGE_BUCKET = 'your-storage-bucket.firebasestorage.app';
const STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || DEFAULT_STORAGE_BUCKET;
const STORAGE_BASE = `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o`;

const buildStorageAssetUrl = (path: string, token: string): string =>
  `${STORAGE_BASE}/${path}?alt=media&token=${token}`;

const STUDYNAVI_BRAND_IMAGE = '/assets/studynavi-logo.png';

export const IMAGE_LINKS = {
  pdf: {
    flags: {
      Australia: buildStorageAssetUrl('flags%2Fau.svg', '46d512ca-c153-4a6c-abcc-d498ed56bccc'),
      Canada: buildStorageAssetUrl('flags%2Fca.svg', 'f8e61986-5b09-47db-9410-dab0e3842915'),
      Ireland: buildStorageAssetUrl('flags%2Fie.svg', 'e97298ab-a74b-4898-bd26-f28d7baafece'),
      'New Zealand': buildStorageAssetUrl('flags%2Fnz.svg', '009b178e-b7df-4df6-a797-68271810506d'),
      Germany: buildStorageAssetUrl('flags%2Fgermany.svg', 'b7ec4a4a-8a84-4bf0-b48c-15b09020391c'),
    },
    icons: {
      logo: STUDYNAVI_BRAND_IMAGE,
      disclaimer: buildStorageAssetUrl('favicon-32x32.png', '62be70f0-c981-4b6b-b7de-71ea9f968d34'),
      recommendation: buildStorageAssetUrl('Rectangle-3-1.webp', '911649d4-294b-4ad8-b9a8-5ecc0bdf8615'),
      plane: buildStorageAssetUrl('icons%2Fplane.png', '84367ff8-1b13-4d17-968a-e32b7058f1d6'),
      checkbox: buildStorageAssetUrl('icons%2Fcheckbox.png', 'f4a7669b-ee24-45fc-8ef0-9ce869b5ec7a'),
      checked: buildStorageAssetUrl('icons%2Fchecked.png', '218e4cba-40dc-41ac-ade8-a69836cf46a7'),
      document: buildStorageAssetUrl('icons%2Fdocument.png', 'fc74430a-c3b6-465b-b65a-742880f9d4bb'),
      warning: buildStorageAssetUrl('icons%2Fwarning.png', 'ec31f591-3937-4750-8cd3-0e2bbb705b97'),
      idea: buildStorageAssetUrl('icons%2Fidea.png', '9003e983-01c1-4e8b-9dd4-4b7f9e6592a2'),
      redWarningIcon: buildStorageAssetUrl('favicon-32x32.png', '62be70f0-c981-4b6b-b7de-71ea9f968d34'),
      dynamicImage: buildStorageAssetUrl('Screenshot%202025-12-31%20142820.png', '84ae7c17-ed07-4fd1-b7ab-6ee0a02c9544'),
      pay: buildStorageAssetUrl('icons%2Fpay.png', '040d3588-62d2-40d2-a2fa-dbab46840825'),
      bank: buildStorageAssetUrl('icons%2Fbank.png', 'd18be29d-ec58-40a3-b662-1bbcc0a3cb37'),
    },
  },
} as const;

export const PDF_FLAG_URLS = IMAGE_LINKS.pdf.flags;
export const PDF_ICON_URLS = IMAGE_LINKS.pdf.icons;
