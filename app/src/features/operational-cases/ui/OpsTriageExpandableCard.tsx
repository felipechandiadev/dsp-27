'use client';

import { useCallback, useEffect, type ReactNode } from 'react';
import { Card, IconButton } from '@felipechandiadev/ui';
import {
  opsAnchorKey,
  type OpsEntityKind,
} from './compute-ops-traceability-edges';

type Props = {
  kind: OpsEntityKind;
  id: string;
  code: string;
  subtitle?: string;
  headerEnd?: ReactNode;
  summary: ReactNode;
  expanded: boolean;
  focused: boolean;
  linked: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  registerAnchor?: (
    kind: OpsEntityKind,
    id: string,
    el: HTMLElement | null,
  ) => void;
  onLayoutChange?: () => void;
  children: ReactNode;
};

export function OpsTriageExpandableCard({
  kind,
  id,
  code,
  subtitle,
  headerEnd,
  summary,
  expanded,
  focused,
  linked,
  onSelect,
  onToggleExpand,
  registerAnchor,
  onLayoutChange,
  children,
}: Props) {
  const unitClass = [
    'ops-triage-card-unit',
    focused ? 'ops-triage-card-unit--focus' : '',
    linked && !focused ? 'ops-triage-card-unit--linked' : '',
    expanded ? 'ops-triage-card-unit--expanded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      registerAnchor?.(kind, id, el);
    },
    [id, kind, registerAnchor],
  );

  useEffect(() => {
    return () => registerAnchor?.(kind, id, null);
  }, [id, kind, registerAnchor]);

  useEffect(() => {
    onLayoutChange?.();
  }, [expanded, onLayoutChange]);

  return (
    <div
      ref={setRef}
      className={unitClass}
      data-ops-anchor={opsAnchorKey(kind, id)}
    >
      <Card
        title={
          <span className="ops-triage-card-title-row">
            <IconButton
              icon={expanded ? 'ChevronUp' : 'ChevronDown'}
              variant="action"
              size="sm"
              ariaLabel={
                expanded
                  ? 'Ocultar detalle y acciones'
                  : 'Ver detalle y acciones'
              }
              onClick={(event) => {
                event.stopPropagation();
                onToggleExpand();
              }}
            />
            <span className="ops-triage-card-folio">{code}</span>
          </span>
        }
        subtitle={subtitle}
        headerEnd={headerEnd}
        content={summary}
        onClick={onSelect}
      />
      {expanded ? (
        <div
          className="ops-triage-card-unit__detail"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
