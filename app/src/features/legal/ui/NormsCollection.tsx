'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Badge,
  Card,
  CollectionPageLayout,
  IconButton,
} from '@felipechandiadev/ui';
import {
  canWriteLegal,
  legalKindLabel,
  legalStatusLabel,
  type NormListItem,
} from './legal-types';
import { CreateNormDialog } from './CreateNormDialog';

type Props = {
  rows: NormListItem[];
  role?: string | null;
};

export function NormsCollection({ rows, role }: Props) {
  const router = useRouter();
  const canWrite = canWriteLegal(role);
  const [createOpen, setCreateOpen] = useState(false);

  const items = useMemo(
    () =>
      rows.map((n) => (
        <Card
          key={n.id}
          fillHeight
          className="cursor-pointer"
          onClick={() => router.push(`/legal/${encodeURIComponent(n.code)}`)}
          title={
            <Link
              href={`/legal/${encodeURIComponent(n.code)}`}
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {n.numberLabel}
            </Link>
          }
          subtitle={n.shortTitle}
          headerEnd={
            <Badge
              variant={n.status === 'in_force' ? 'success' : 'secondary'}
            >
              {legalStatusLabel(n.status)}
            </Badge>
          }
        >
          <p className="text-sm text-[var(--color-muted-foreground)] m-0">
            {legalKindLabel(n.kind)} · {n.code}
          </p>
          {n.summary ? (
            <p className="text-sm text-[var(--color-muted-foreground)] m-0 mt-2 line-clamp-3">
              {n.summary}
            </p>
          ) : null}
        </Card>
      )),
    [rows, router],
  );

  return (
    <>
      <CollectionPageLayout
        title="Normas"
        subtitle="Marco normativo Cap. 1 — catálogo y PDF oficiales"
        showSearch
        searchPlaceholder="Buscar norma…"
        contentEmptyMessage="No hay normas."
        contentGridColumns={{ default: 1, md: 2 }}
        contentGridGapClassName="gap-3"
        contentGridItemsAlign="stretch"
        data-test-id="legal-norms-collection"
        addAction={
          canWrite ? (
            <IconButton
              icon="Plus"
              variant="action"
              size="md"
              ariaLabel="Nueva norma"
              onClick={() => setCreateOpen(true)}
            />
          ) : undefined
        }
        contentItems={items}
      />
      {canWrite ? (
        <CreateNormDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
        />
      ) : null}
    </>
  );
}
