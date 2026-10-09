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

export type TaskRow = {
  id: string;
  code: string | null;
  title: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  leadRole: string | null;
  projectCode: string;
  projectTitle: string;
};

type Props = {
  rows: TaskRow[];
  totalRows: number;
  limit?: number;
};

/** Columnas las fija `.dsp-portfolio-card-grid` en CSS (2 / 3 / 4). */
const CARD_COLS = 4;

export function TasksDataGrid({ rows, totalRows, limit = 25 }: Props) {
  const router = useRouter();
  const { view } = useListCardsView();

  const columns: DataGridColumn[] = [
    { field: 'code', headerName: 'Código', width: 120, sortable: true },
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
    {
      field: 'projectCode',
      headerName: 'Proyecto',
      width: 110,
      sortable: true,
    },
    { field: 'leadRole', headerName: 'Conduce', width: 140 },
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
        searchPlaceholder="Buscar tareas…"
        contentEmptyMessage="No hay tareas aún."
        contentGridColumns={CARD_COLS}
        contentGridGapClassName="gap-3"
        contentGridClassName="dsp-portfolio-card-grid"
        contentGridItemsAlign="start"
        data-test-id="tasks-collection-grid"
        contentItems={rows.map((t) => (
          <Card
            key={t.id}
            fillHeight
            className="dsp-portfolio-card cursor-pointer"
            onClick={() => router.push(`/projects/${t.projectCode}`)}
            title={t.code ?? t.title}
            headerEnd={<Badge variant="secondary">{t.status}</Badge>}
            subtitle={t.code ? t.title : undefined}
          >
            <p className="text-sm text-[var(--color-muted-foreground)] m-0 line-clamp-3">
              <Link
                href={`/projects/${t.projectCode}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {t.projectCode} — {t.projectTitle}
              </Link>
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] m-0 mt-auto pt-2">
              {[t.startsOn, t.endsOn].filter(Boolean).join(' → ') ||
                'Sin fechas'}
              {t.leadRole ? ` · ${t.leadRole}` : ''}
            </p>
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
        if (row?.projectCode) router.push(`/projects/${row.projectCode}`);
      }}
      data-test-id="tasks-datagrid"
    />
  );
}
