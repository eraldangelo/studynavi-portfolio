
import { PDF_FLAG_URLS, PDF_ICON_URLS } from '@/config/imageLinks';

export const MARGINS = {
  top: 8,
  bottom: 12,
  left: 8,
  right: 8,
};

export const PAGE_SETUP = {
  width: 210, // A4 width in mm
  height: 297, // A4 height in mm
};

export const FLAG_URLS: { [key: string]: string } = { ...PDF_FLAG_URLS };

export const ICON_URLS = { ...PDF_ICON_URLS };
