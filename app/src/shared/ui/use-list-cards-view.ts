'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PORTFOLIO_CARDS_LIMIT, PORTFOLIO_LIST_LIMIT } from './list-query';

export type ListCardsView = 'list' | 'cards';

/** Toggle lista/cards; default lista (`?view=` ausente o `list`). */
export function useListCardsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('view');
  const view: ListCardsView = fromUrl === 'cards' ? 'cards' : 'list';

  const setView = useCallback(
    (next: ListCardsView) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next === 'list') {
        params.delete('view');
        params.set('limit', String(PORTFOLIO_LIST_LIMIT));
      } else {
        params.set('view', 'cards');
        params.set('limit', String(PORTFOLIO_CARDS_LIMIT));
      }
      params.set('page', '1');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { view, setView };
}
