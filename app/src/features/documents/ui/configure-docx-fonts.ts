'use client';

import { configureDefaultFonts } from '@betteroffice/docx/layout';
import * as fonts from '@betteroffice/fonts';

let configured = false;

/**
 * Provider métrico (Carlito↔Calibri, etc.) para paginación estable.
 * Los TTF se sirven desde /betteroffice-fonts/ (sync-betteroffice-fonts.mjs).
 */
export function ensureDocxFontsConfigured(): void {
  if (configured || typeof window === 'undefined') return;
  configureDefaultFonts({
    fonts,
    baseUrl: '/betteroffice-fonts/',
  });
  configured = true;
}
