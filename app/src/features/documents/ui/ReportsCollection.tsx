'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Badge,
  Card,
  CollectionPageLayout,
  IconButton,
} from '@felipechandiadev/ui';
import { canWriteDocumentTypes } from '@/shared/auth/user-roles';
import {
  reportStatusLabel,
  type ManagedDocumentListItem,
} from '@/features/documents/ui/report-types';
type Props = {
  rows: ManagedDocumentListItem[];
  role?: string | null;
};

export function ReportsCollection({ rows, role }: Props) {
  const router = useRouter();
  const canWrite = canWriteDocumentTypes(role);

  const items = useMemo(
    () =>
      rows.map((doc) => (
        <Card
          key={doc.id}
          fillHeight
          className="cursor-pointer"
          onClick={() =>
            router.push(`/documents/reports/${encodeURIComponent(doc.code)}`)
          }
          title={
            <Link
              href={`/documents/reports/${encodeURIComponent(doc.code)}`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {doc.title}
            </Link>
          }
          subtitle={doc.code}
          headerEnd={
            <Badge
              variant={doc.status === 'published' ? 'success' : 'secondary'}
            >
              {reportStatusLabel(doc.status)}
            </Badge>
          }
        >
          <p className="m-0 text-sm text-[var(--color-muted-foreground)]">
            {doc.documentType?.name ?? 'Sin tipo'} ·{' '}
            {new Date(doc.updatedAt).toLocaleString('es-CL')}
          </p>
        </Card>
      )),
    [rows, router],
  );

  return (
    <CollectionPageLayout
      title="Biblioteca"
      subtitle="Documentos gestionados de la Dirección"
      showSearch
      searchPlaceholder="Buscar documento…"
      contentEmptyMessage="No hay documentos."
      contentGridColumns={{ default: 1, md: 2 }}
      contentGridGapClassName="gap-3"
      contentGridItemsAlign="stretch"
      data-test-id="documents-library-collection"
      addAction={
        canWrite ? (
          <IconButton
            icon="Plus"
            variant="action"
            size="md"
            ariaLabel="Redactar documento"
            onClick={() => router.push('/documents/compose')}
          />
        ) : undefined
      }
      contentItems={items}
    />
  );
}
