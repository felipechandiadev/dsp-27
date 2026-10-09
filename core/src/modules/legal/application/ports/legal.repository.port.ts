import { LegalNorm } from '@modules/legal/domain/legal-norm.entity';
import { LegalObligation } from '@modules/legal/domain/legal-obligation.entity';

export const LEGAL_REPOSITORY = Symbol('LEGAL_REPOSITORY');

export type CreateNormInput = {
  code: string;
  kind: string;
  numberLabel: string;
  shortTitle: string;
  status: string;
  publishedOn?: string | null;
  effectiveOn?: string | null;
  summary?: string | null;
  sortOrder?: number;
};

export interface LegalRepositoryPort {
  listNorms(filters?: {
    kind?: string;
    status?: string;
  }): Promise<LegalNorm[]>;
  findNormByCode(code: string): Promise<LegalNorm | null>;
  findNormById(id: string): Promise<LegalNorm | null>;
  createNorm(data: CreateNormInput): LegalNorm;
  saveNorm(norm: LegalNorm): Promise<LegalNorm>;
  listObligations(): Promise<LegalObligation[]>;
}
