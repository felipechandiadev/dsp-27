'use client';

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type {
  OpsEntityKind,
  OpsTraceabilityEdge,
  OpsTraceabilityEdgeKind,
} from './compute-ops-traceability-edges';

type Point = { x: number; y: number };

type RenderedEdge = {
  key: string;
  d: string;
  kind: OpsTraceabilityEdgeKind;
  emphasized: boolean;
};

type Selection =
  | { kind: OpsEntityKind; id: string }
  | null;

function anchorPoint(
  el: HTMLElement,
  boardRect: DOMRect,
  side: 'left' | 'right',
): Point {
  const rect = el.getBoundingClientRect();
  return {
    x:
      side === 'left'
        ? rect.left - boardRect.left
        : rect.right - boardRect.left,
    y: rect.top - boardRect.top + rect.height / 2,
  };
}

function bezierPath(from: Point, to: Point, kind: OpsTraceabilityEdgeKind): string {
  const span = to.x - from.x;
  const dx = Math.max(kind === 'inc-op' ? 80 : 40, span * 0.42);
  return `M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`;
}

function edgeStrokeWidth(kind: OpsTraceabilityEdgeKind, emphasized: boolean): number {
  if (kind === 'inc-op') return emphasized ? 3 : 2.25;
  return emphasized ? 2.5 : 1.75;
}

function buildRenderedEdges(
  edges: OpsTraceabilityEdge[],
  boardEl: HTMLElement,
  getAnchorElement: (kind: OpsEntityKind, id: string) => HTMLElement | undefined,
  selection: Selection,
): RenderedEdge[] {
  const boardRect = boardEl.getBoundingClientRect();
  const rendered: RenderedEdge[] = [];

  for (const edge of edges) {
    const fromEl = getAnchorElement(edge.from.kind, edge.from.id);
    const toEl = getAnchorElement(edge.to.kind, edge.to.id);
    if (!fromEl || !toEl) continue;

    const from = anchorPoint(fromEl, boardRect, 'right');
    const to = anchorPoint(toEl, boardRect, 'left');
    const key = `${edge.kind}:${edge.from.kind}:${edge.from.id}:${edge.to.kind}:${edge.to.id}`;
    const emphasized =
      (selection?.kind === edge.from.kind && selection.id === edge.from.id) ||
      (selection?.kind === edge.to.kind && selection.id === edge.to.id);

    rendered.push({
      key,
      d: bezierPath(from, to, edge.kind),
      kind: edge.kind,
      emphasized,
    });
  }

  return rendered;
}

type Props = {
  boardRef: RefObject<HTMLElement | null>;
  edges: OpsTraceabilityEdge[];
  selection: Selection;
  layoutVersion: number;
  getAnchorElement: (kind: OpsEntityKind, id: string) => HTMLElement | undefined;
  active: boolean;
};

export function OpsTriageConnectorOverlay({
  boardRef,
  edges,
  selection,
  layoutVersion,
  getAnchorElement,
  active,
}: Props) {
  const [desktop, setDesktop] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [paths, setPaths] = useState<RenderedEdge[]>([]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 901px)');
    const apply = () => setDesktop(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useLayoutEffect(() => {
    const boardEl = boardRef.current;
    if (!boardEl || !active || !desktop) {
      setPaths([]);
      return;
    }

    let raf = 0;
    const measure = () => {
      const rect = boardEl.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
      setPaths(
        buildRenderedEdges(edges, boardEl, getAnchorElement, selection),
      );
    };

    raf = window.requestAnimationFrame(measure);

    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(measure);
    });
    observer.observe(boardEl);

    const scrollables = boardEl.querySelectorAll('[data-ops-column-scroll]');
    const onScroll = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(measure);
    };
    scrollables.forEach((el) => {
      el.addEventListener('scroll', onScroll, { passive: true });
    });

    const onResize = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      scrollables.forEach((el) => {
        el.removeEventListener('scroll', onScroll);
      });
      window.removeEventListener('resize', onResize);
    };
  }, [
    active,
    boardRef,
    desktop,
    edges,
    getAnchorElement,
    layoutVersion,
    selection,
  ]);

  const svgContent = useMemo(
    () =>
      paths.map((path) => (
        <path
          key={path.key}
          d={path.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={edgeStrokeWidth(path.kind, path.emphasized)}
          strokeDasharray={path.kind === 'inc-op' ? '8 5' : undefined}
          strokeLinecap="round"
          className="ops-triage-connector-path"
          opacity={path.emphasized ? 1 : 0.72}
        />
      )),
    [paths],
  );

  if (!active || !desktop || paths.length === 0 || size.width === 0) {
    return null;
  }

  return (
    <svg
      className="ops-triage-connector"
      width={size.width}
      height={size.height}
      aria-hidden
    >
      <g>{svgContent}</g>
    </svg>
  );
}
