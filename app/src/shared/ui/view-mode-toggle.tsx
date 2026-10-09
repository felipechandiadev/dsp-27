'use client';

import { LayoutGrid, List } from 'lucide-react';
import { ButtonGroupToggle } from '@felipechandiadev/ui';
import { useListCardsView } from './use-list-cards-view';
import type { ListCardsView } from './use-list-cards-view';

/** Toggle fijo para `BasicPageLayout.headerActions` (solo iconos). */
export function ViewModeToggle({
  view,
  onChange,
}: {
  view: ListCardsView;
  onChange: (next: ListCardsView) => void;
}) {
  return (
    <ButtonGroupToggle
      aria-label="Vista lista o cards"
      value={view}
      density="default"
      size="md"
      variant="outlined"
      onChange={(id) => onChange(id as ListCardsView)}
      options={[
        {
          id: 'list',
          label: <List size={18} strokeWidth={2.25} aria-hidden />,
        },
        {
          id: 'cards',
          label: <LayoutGrid size={18} strokeWidth={2.25} aria-hidden />,
        },
      ]}
    />
  );
}

/** Lee/escribe `?view=` — usar en el header de la página para no mover el control. */
export function ViewModeToggleConnected() {
  const { view, setView } = useListCardsView();
  return <ViewModeToggle view={view} onChange={setView} />;
}
