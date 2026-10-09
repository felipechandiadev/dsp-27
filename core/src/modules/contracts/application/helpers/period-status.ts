import { ForbiddenException } from '@nestjs/common';
import { ContractPeriodDocument } from '@modules/contracts/domain/contract-period-document.entity';

const OK = new Set(['received', 'approved']);

export function computePeriodStatusFromDocs(
  docs: ContractPeriodDocument[],
  current: string,
): string {
  if (current === 'certified') return 'certified';
  if (!docs.length) return 'open';
  const allOk = docs.every((d) => OK.has(d.status));
  if (allOk) return 'ready_for_cert';
  const anyProgress = docs.some((d) => d.status !== 'missing');
  return anyProgress ? 'docs_pending' : 'open';
}

export function canCertify(docs: ContractPeriodDocument[]): boolean {
  return docs.length > 0 && docs.every((d) => OK.has(d.status));
}

export function assertItsOrDireccion(role: string): void {
  if (role !== 'its' && role !== 'direccion') {
    throw new ForbiddenException(
      'Solo ITS o Dirección pueden realizar esta acción',
    );
  }
}
