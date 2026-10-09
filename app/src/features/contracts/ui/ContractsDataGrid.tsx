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

export type ContractRow = {
  id: string;
  code: string;
  kind: string;
  title: string;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  contractor: { id: string; rut: string; name: string } | null;
};

type Props = {
  rows: ContractRow[];
  totalRows: number;
  limit?: number;
};

const CARD_COLS = 4;

export function ContractsDataGrid({ rows, totalRows, limit = 25 }: Props) {
  const router = useRouter();
  const { view } = useListCardsView();

  const columns: DataGridColumn[] = [
    { field: 'code', headerName: 'Código', width: 130, sortable: true },
    {
      field: 'title',
      headerName: 'Título',
      flex: 1,
      minWidth: 180,
      sortable: true,
    },
    { field: 'kind', headerName: 'Tipo', width: 110 },
    {
      field: 'status',
      headerName: 'Estado',
      width: 110,
      renderCell: ({ value }) => (
        <Badge variant="secondary">{String(value ?? '')}</Badge>
      ),
    },
    {
      field: 'contractor',
      headerName: 'Privado',
      flex: 1,
      minWidth: 140,
      valueGetter: ({ row }) =>
        row.contractor
          ? `${row.contractor.name} (${row.contractor.rut})`
          : '',
    },
    { field: 'startsOn', headerName: 'Inicio', width: 110, type: 'date' },
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
        searchPlaceholder="Buscar contratos…"
        contentEmptyMessage="No hay contratos."
        contentGridColumns={CARD_COLS}
        contentGridGapClassName="gap-3"
        contentGridClassName="dsp-portfolio-card-grid"
        contentGridItemsAlign="start"
        data-test-id="contracts-collection-grid"
        contentItems={rows.map((c) => (
          <Card
            key={c.id}
            fillHeight
            className="dsp-portfolio-card cursor-pointer"
            onClick={() => router.push(`/contracts/${c.code}`)}
            title={
              <Link
                href={`/contracts/${c.code}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {c.code}
              </Link>
            }
            headerEnd={<Badge variant="secondary">{c.status}</Badge>}
            subtitle={c.title}
          >
            <p className="text-sm text-[var(--color-muted-foreground)] m-0">
              {c.kind}
              {c.contractor ? ` · ${c.contractor.name}` : ''}
            </p>
            {c.contractor ? (
              <p className="text-xs text-[var(--color-muted-foreground)] m-0 mt-auto pt-2">
                RUT {c.contractor.rut}
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
        if (row?.code) router.push(`/contracts/${row.code}`);
      }}
      data-test-id="contracts-datagrid"
    />
  );
}
