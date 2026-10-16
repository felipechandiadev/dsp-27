/** Fuentes locales OFL para BetterOffice (medición / paginación). */
export const DOCX_EDITOR_FONTS = [
  {
    family: 'Source Sans 3',
    src: '/fonts/SourceSans3-Regular.woff2',
    weight: 400 as const,
  },
  {
    family: 'Source Sans 3',
    src: '/fonts/SourceSans3-Bold.woff2',
    weight: 700 as const,
  },
  {
    family: 'Source Serif 4',
    src: '/fonts/SourceSerif4-Regular.woff2',
    weight: 400 as const,
  },
  {
    family: 'Source Serif 4',
    src: '/fonts/SourceSerif4-Bold.woff2',
    weight: 700 as const,
  },
] as const;

export const DOCX_FONT_FAMILIES = [
  { name: 'Source Sans 3', fontFamily: '"Source Sans 3", sans-serif', category: 'sans-serif' as const },
  { name: 'Source Serif 4', fontFamily: '"Source Serif 4", serif', category: 'serif' as const },
  'Arial',
  'Times New Roman',
  'Courier New',
] as const;
