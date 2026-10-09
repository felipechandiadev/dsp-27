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

export function ProjectsDataGrid({ rows }: { rows: ProjectRow[] }) {
  const router = useRouter();
  const { view, setView } = useListCardsView();
  const toggle = <ViewModeToggle view={view} onChange={setView} />;

  const columns: DataGridColumn[] = [
    { field: 'code', headerName: 'Código', width: 100, sortable: true },
    { field: 'title', headerName: 'Título', flex: 1, minWidth: 180, sortable: true },
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
      <div className="flex flex-col gap-3">
        <div className="flex justify-end">{toggle}</div>
        <div className="flex flex-col gap-3 max-w-3xl">
          {rows.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)] m-0">
              No hay proyectos.
            </p>
          ) : (
            rows.map((p) => (
              <Card
                key={p.id}
                title={
                  <Link
                    href={`/projects/${p.code}`}
                    className="hover:underline"
                  >
                    {p.code} — {p.title}
                  </Link>
                }
                headerEnd={<Badge variant="secondary">{p.status}</Badge>}
                subtitle={
                  p.objectiveCodes?.length
                    ? `Aporta a ${p.objectiveCodes.join(', ')}`
                    : p.leadRole ?? undefined
                }
              >
                <p className="text-sm text-[var(--color-muted-foreground)] m-0">
                  {p.summary ?? 'Sin resumen.'}
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
        title="Proyectos"
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
          if (row?.code) router.push(`/projects/${row.code}`);
        }}
        height="auto"
      />
    </NextNavProvider>
  );
}
