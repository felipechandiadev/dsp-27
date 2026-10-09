import { LegalNorm } from '@modules/legal/domain/legal-norm.entity';
import { LegalObligation } from '@modules/legal/domain/legal-obligation.entity';

export const LEGAL_REPOSITORY = Symbol('LEGAL_REPOSITORY');

export interface LegalRepositoryPort {
  listNorms(): Promise<LegalNorm[]>;
  listObligations(): Promise<LegalObligation[]>;
}
