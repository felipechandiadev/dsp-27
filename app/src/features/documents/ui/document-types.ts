export type DocumentCreationMode = 'composed' | 'attachment';

export type DocumentTypeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: string;
  creationMode: DocumentCreationMode;
  createdAt?: string;
};

export function creationModeLabel(mode: string): string {
  return mode === 'composed' ? 'En sistema' : 'Adjunto';
}
