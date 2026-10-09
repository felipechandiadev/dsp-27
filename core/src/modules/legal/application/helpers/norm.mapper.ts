import { LegalNorm } from '@modules/legal/domain/legal-norm.entity';
import { MultimediaAsset } from '@modules/multimedia/domain/multimedia-asset.entity';

export function mapNormListItem(n: LegalNorm) {
  return {
    id: n.id,
    code: n.code,
    kind: n.kind,
    numberLabel: n.numberLabel,
    shortTitle: n.shortTitle,
    status: n.status,
    publishedOn: n.publishedOn,
    effectiveOn: n.effectiveOn,
    summary: n.summary,
    sortOrder: n.sortOrder,
  };
}

export function mapPdfAsset(asset: MultimediaAsset | null) {
  if (!asset) return null;
  return {
    id: asset.id,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    byteSize: asset.byteSize,
    createdAt: asset.createdAt,
  };
}

export function mapNormDetail(
  n: LegalNorm,
  pdf: MultimediaAsset | null,
) {
  return {
    ...mapNormListItem(n),
    pdfAsset: mapPdfAsset(pdf),
  };
}
