'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Card,
  CollectionGrid,
  DataGrid,
  type DataGridColumn,
} from '@felipechandiadev/ui';
import { useListCardsView } from '@/shared/ui/use-list-cards-view';

export type ProjectRow = {
  id: string;
  code: string;
  title: string;
  kind: string;
  status: string;
  leadRole: string | null;
  summary: string | null;
  startsOn: string | null;
  endsOn: string | null;
  objectiveCodes: string[];
};

type Props = {
  rows: ProjectRow[];
  totalRows: number;
  limit?: number;
};

/** Columnas las fija `.dsp-portfolio-card-grid` en CSS (2 / 3 / 4). */
const CARD_COLS = 4;

export function ProjectsDataGrid({ rows, totalRows, limit = 25 }: Props) {
  const router = useRouter();
  const { view } = useListCardsView();

  const columns: DataGridColumn[] = [
    { field: 'code', headerName: 'Código', width: 100, sortable: true },
    {
      field: 'title',
      headerName: 'Título',
      flex: 1,
      minWidth: 180,
      sortable: true,
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 120,
      renderCell: ({ value }) => (
        <Badge variant="secondary">{String(value ?? '')}</Badge>
      ),
    },
    { field: 'leadRole', headerName: 'Conduce', width: 140 },
    {
      field: 'objectiveCodes',
      headerName: 'O',
      width: 100,
      valueGetter: ({ row }) =>
        Array.isArray(row.objectiveCodes)
          ? row.objectiveCodes.join(', ')
          : '',
    },
    { field: 'startsOn', headerName: 'Inicio', width: 110, type: 'date' },
    { field: 'endsOn', headerName: 'Término', width: 110, type: 'date' },
  ];

  if (view === 'cards') {
    return (
      <CollectionGrid
        totalRows={totalRows}
        limit={limit}
        fillViewport
        viewportBottomInset={16}
        showSearch
        showFooter
        searchPlaceholder="Buscar proyectos…"
        contentEmptyMessage="No hay proyectos."
        contentGridColumns={CARD_COLS}
        contentGridGapClassName="gap-3"
        contentGridClassName="dsp-portfolio-card-grid"
        contentGridItemsAlign="start"
        data-test-id="projects-collection-grid"
        contentItems={rows.map((p) => (
          <Card
            key={p.id}
            fillHeight
            className="dsp-portfolio-card cursor-pointer"
            onClick={() => router.push(`/projects/${p.code}`)}
            title={
              <Link
                href={`/projects/${p.code}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {p.code}
              </Link>
            }
            headerEnd={<Badge variant="secondary">{p.status}</Badge>}
            subtitle={p.title}
          >
            <p className="text-sm text-[var(--color-muted-foreground)] m-0 line-clamp-4">
              {p.summary ?? 'Sin resumen.'}
            </p>
            {p.objectiveCodes?.length ? (
              <p className="text-xs text-[var(--color-muted-foreground)] m-0 mt-auto pt-2">
                {p.objectiveCodes.join(', ')}
                {p.leadRole ? ` · ${p.leadRole}` : ''}
              </p>
            ) : null}
          </Card>
        ))}
      />
    );
  }

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      totalRows={totalRows}
      limit={limit}
      fillViewport
      viewportBottomInset={16}
      showFooter
      showSearch
      showSortButton={false}
      showFilterButton={false}
      showExportButton={false}
      onRowClick={(row) => {
        if (row?.code) router.push(`/projects/${row.code}`);
      }}
      data-test-id="projects-datagrid"
    />
  );
}
