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

export type StaffRow = {
  id: string;
  code: string;
  unit: string;
  ds97Profile: string | null;
  inspectorQualityStatus: string;
  status: string;
  readyForGrant?: boolean;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email: string | null;
  } | null;
};

type Props = {
  rows: StaffRow[];
  totalRows: number;
  limit?: number;
};

const CARD_COLS = 4;

export function StaffDataGrid({ rows, totalRows, limit = 25 }: Props) {
  const router = useRouter();
  const { view } = useListCardsView();

  const columns: DataGridColumn[] = [
    { field: 'code', headerName: 'Código', width: 110, sortable: true },
    {
      field: 'person',
      headerName: 'Nombre',
      flex: 1,
      minWidth: 160,
      valueGetter: ({ row }) =>
        row.person
          ? `${row.person.firstName} ${row.person.lastName}`
          : '',
    },
    {
      field: 'document',
      headerName: 'RUT',
      width: 130,
      valueGetter: ({ row }) => row.person?.documentNumber ?? '',
    },
    { field: 'unit', headerName: 'Unidad', width: 120 },
    {
      field: 'inspectorQualityStatus',
      headerName: 'Calidad',
      width: 110,
      renderCell: ({ value }) => (
        <Badge variant="secondary">{String(value ?? '')}</Badge>
      ),
    },
    {
      field: 'status',
      headerName: 'Estado',
      width: 100,
      renderCell: ({ value }) => (
        <Badge variant="secondary">{String(value ?? '')}</Badge>
      ),
    },
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
        searchPlaceholder="Buscar personal…"
        contentEmptyMessage="No hay personal."
        contentGridColumns={CARD_COLS}
        contentGridGapClassName="gap-3"
        contentGridClassName="dsp-portfolio-card-grid"
        contentGridItemsAlign="start"
        data-test-id="staff-collection-grid"
        contentItems={rows.map((s) => (
          <Card
            key={s.id}
            fillHeight
            className="dsp-portfolio-card cursor-pointer"
            onClick={() => router.push(`/staff/${s.code}`)}
            title={
              <Link
                href={`/staff/${s.code}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {s.code}
              </Link>
            }
            headerEnd={
              <Badge variant="secondary">{s.inspectorQualityStatus}</Badge>
            }
            subtitle={
              s.person
                ? `${s.person.firstName} ${s.person.lastName}`
                : 'Sin persona'
            }
          >
            <p className="text-sm text-[var(--color-muted-foreground)] m-0">
              {s.unit}
              {s.ds97Profile ? ` · ${s.ds97Profile}` : ''}
            </p>
            {s.person ? (
              <p className="text-xs text-[var(--color-muted-foreground)] m-0 mt-auto pt-2">
                {s.person.documentNumber}
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
        if (row?.code) router.push(`/staff/${row.code}`);
      }}
      data-test-id="staff-datagrid"
    />
  );
}
