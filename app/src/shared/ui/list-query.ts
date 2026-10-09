/** Utilidades compartidas para listados DataGrid (page/limit/search/view). */

export type ListSearchParams = Record<string, string | string[] | undefined>;

export function searchParamsToQuery(params: ListSearchParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') search.set(key, value);
    else if (Array.isArray(value)) {
      for (const item of value) search.append(key, item);
    }
  }
  return search.toString();
}

/** Cards: 12/página (4×3). Lista: 25. */
export const PORTFOLIO_LIST_LIMIT = 25;
export const PORTFOLIO_CARDS_LIMIT = 12;

export function parseListQuery(params: ListSearchParams) {
  const view = params.view === 'cards' ? 'cards' : 'list';
  const defaultLimit =
    view === 'cards' ? PORTFOLIO_CARDS_LIMIT : PORTFOLIO_LIST_LIMIT;
  const pageRaw = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limitRaw =
    typeof params.limit === 'string' ? parseInt(params.limit, 10) : defaultLimit;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(limitRaw, 100)
      : defaultLimit;
  const search =
    typeof params.search === 'string' ? params.search.trim() : '';
  return { page, limit, search, view };
}

export function paginateRows<T>(
  rows: T[],
  page: number,
  limit: number,
): { pageRows: T[]; totalRows: number } {
  const totalRows = rows.length;
  const start = (page - 1) * limit;
  return { pageRows: rows.slice(start, start + limit), totalRows };
}

export function filterBySearch<T>(
  rows: T[],
  search: string,
  fields: (row: T) => Array<string | null | undefined>,
): T[] {
  const q = search.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    fields(row).some((f) => (f ?? '').toLowerCase().includes(q)),
  );
}
