'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Card } from '@felipechandiadev/ui';
import { EntityAttachments } from '@/features/docs/ui/EntityAttachments';
import { EditNormDialog } from './EditNormDialog';
import {
  legalKindLabel,
  legalStatusLabel,
  type NormDetail,
} from './legal-types';

type Props = {
  norm: NormDetail;
  canWrite: boolean;
};

export function NormDetailClient({ norm, canWrite }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <div className="grid gap-4 max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{legalKindLabel(norm.kind)}</Badge>
            <Badge
              variant={norm.status === 'in_force' ? 'success' : 'secondary'}
            >
              {legalStatusLabel(norm.status)}
            </Badge>
          </div>
          {canWrite ? (
            <Button
              type="button"
              variant="outlined"
              onClick={() => setEditOpen(true)}
            >
              Editar
            </Button>
          ) : null}
        </div>

        <Card title="Resumen">
          <p className="m-0 text-sm leading-relaxed">
            {norm.summary ?? 'Sin resumen.'}
          </p>
        </Card>

        <Card title="PDF oficial">
          <EntityAttachments
            asset={norm.pdfAsset}
            uploadPath={
              canWrite
                ? `/api/legal/norms/${encodeURIComponent(norm.code)}/pdf`
                : undefined
            }
            canEdit={canWrite}
            emptyLabel="Aún no hay PDF oficial adjunto."
            uploadLabel={norm.pdfAsset ? 'Reemplazar PDF' : 'Subir PDF'}
          />
        </Card>

        <p className="m-0 text-sm">
          <Link href="/documents/norms" className="underline">
            Volver a Normas
          </Link>
        </p>
      </div>

      {canWrite ? (
        <EditNormDialog
          norm={norm}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </>
  );
}
