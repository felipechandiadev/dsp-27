'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type ListCardsView = 'list' | 'cards';

function defaultViewForViewport(): ListCardsView {
  if (typeof window === 'undefined') return 'cards';
  return window.matchMedia('(min-width: 768px)').matches ? 'list' : 'cards';
}

/** Toggle lista/cards con `?view=list|cards`; default cards móvil / list desde md. */
export function useListCardsView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('view');
  const [view, setViewState] = useState<ListCardsView>(() => {
    if (fromUrl === 'list' || fromUrl === 'cards') return fromUrl;
    return defaultViewForViewport();
  });

  useEffect(() => {
    if (fromUrl === 'list' || fromUrl === 'cards') {
      setViewState(fromUrl);
      return;
    }
    setViewState(defaultViewForViewport());
  }, [fromUrl]);

  const setView = useCallback(
    (next: ListCardsView) => {
      setViewState(next);
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', next);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { view, setView };
}
