'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Badge,
  Card,
  DataGrid,
  NextNavProvider,
  type DataGridColumn,
} from '@felipechandiadev/ui';
import { useListCardsView } from '@/shared/ui/use-list-cards-view';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

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

export function TasksDataGrid({ rows }: { rows: TaskRow[] }) {
  const router = useRouter();
  const { view, setView } = useListCardsView();
  const toggle = <ViewModeToggle view={view} onChange={setView} />;

  const columns: DataGridColumn[] = [
    { field: 'code', headerName: 'Código', width: 120, sortable: true },
    { field: 'title', headerName: 'Título', flex: 1, minWidth: 180, sortable: true },
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
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">{toggle}</div>
        <div className="flex flex-col gap-3 max-w-3xl">
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] m-0">
              No hay tareas aún.
            </p>
          ) : (
            rows.map((t) => (
              <Card
                key={t.id}
                title={
                  <span>
                    {t.code ? `${t.code} — ` : ''}
                    {t.title}
                  </span>
                }
                headerEnd={<Badge variant="secondary">{t.status}</Badge>}
                subtitle={
                  <Link
                    href={`/projects/${t.projectCode}`}
                    className="hover:underline"
                  >
                    {t.projectCode} — {t.projectTitle}
                  </Link>
                }
              >
                <p className="text-sm text-[var(--color-muted-foreground)] m-0">
                  {[t.startsOn, t.endsOn].filter(Boolean).join(' → ') ||
                    'Sin fechas'}
                  {t.leadRole ? ` · ${t.leadRole}` : ''}
                </p>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <NextNavProvider>
      <DataGrid
        title="Tareas"
        columns={columns}
        rows={rows}
        totalRows={rows.length}
        paginationMode="controlled"
        page={1}
        limit={Math.max(rows.length, 1)}
        showFooter={false}
        showSearch={false}
        showSortButton={false}
        showFilterButton={false}
        showExportButton={false}
        headerActions={toggle}
        onRowClick={(row) => {
          if (row?.projectCode) router.push(`/projects/${row.projectCode}`);
        }}
        height="auto"
      />
    </NextNavProvider>
  );
}
