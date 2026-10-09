'use client';

import { IconButton } from '@felipechandiadev/ui';
import type { ListCardsView } from './use-list-cards-view';

export function ViewModeToggle({
  view,
  onChange,
}: {
  view: ListCardsView;
  onChange: (next: ListCardsView) => void;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Vista">
      <IconButton
        icon="LayoutList"
        ariaLabel="Vista lista"
        aria-pressed={view === 'list'}
        variant={view === 'list' ? 'primary' : 'outlined'}
        size="sm"
        onClick={() => onChange('list')}
      />
      <IconButton
        icon="LayoutGrid"
        ariaLabel="Vista cards"
        aria-pressed={view === 'cards'}
        variant={view === 'cards' ? 'primary' : 'outlined'}
        size="sm"
        onClick={() => onChange('cards')}
      />
    </div>
  );
}
