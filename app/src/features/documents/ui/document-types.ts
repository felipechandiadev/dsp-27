export type DocumentTypeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: string;
  createdAt?: string;
};
