import type {
  FieldOperationRow,
  IncidenciaRow,
  RequerimientoRow,
} from './ops-types';

export type OpsEntityKind = 'inc' | 'req' | 'op';

export type OpsLinkedIds = {
  incidenciasIds: Set<string>;
  requerimientoIds: Set<string>;
  operationIds: Set<string>;
};

export type OpsTraceabilityEdgeKind = 'inc-req' | 'req-op' | 'inc-op';

export type OpsAnchor = {
  kind: OpsEntityKind;
  id: string;
};

export type OpsTraceabilityEdge = {
  from: OpsAnchor;
  to: OpsAnchor;
  kind: OpsTraceabilityEdgeKind;
};

const COLUMN_INDEX: Record<OpsEntityKind, number> = {
  inc: 0,
  req: 1,
  op: 2,
};

export function opsAnchorKey(kind: OpsEntityKind, id: string): string {
  return `${kind}:${id}`;
}

function orderAnchors(a: OpsAnchor, b: OpsAnchor): [OpsAnchor, OpsAnchor] {
  return COLUMN_INDEX[a.kind] <= COLUMN_INDEX[b.kind] ? [a, b] : [b, a];
}

function operationLinksToIncidencia(
  inc: IncidenciaRow,
  op: FieldOperationRow,
  requerimientos: RequerimientoRow[],
): boolean {
  if (op.incidenciaId === inc.id) return true;
  if (op.requerimientoId) {
    const req = requerimientos.find((r) => r.id === op.requerimientoId);
    if (!req) return false;
    if (req.incidenciaId === inc.id || inc.requerimientoId === req.id) {
      return true;
    }
  }
  return false;
}

function operationLinksToRequerimiento(
  req: RequerimientoRow,
  op: FieldOperationRow,
): boolean {
  if (op.requerimientoId === req.id) return true;
  if (req.incidenciaId && op.incidenciaId === req.incidenciaId) return true;
  return false;
}

function hasCompleteReqPath(
  incId: string,
  opId: string,
  edges: OpsTraceabilityEdge[],
): boolean {
  for (const reqOp of edges) {
    if (reqOp.kind !== 'req-op' || reqOp.to.id !== opId) continue;
    const reqId = reqOp.from.id;
    const hasIncReq = edges.some(
      (edge) =>
        edge.kind === 'inc-req' &&
        edge.from.id === incId &&
        edge.to.id === reqId,
    );
    if (hasIncReq) return true;
  }
  return false;
}

export function computeOpsTraceabilityEdges(
  linked: OpsLinkedIds,
  data: {
    incidencias: IncidenciaRow[];
    requerimientos: RequerimientoRow[];
    operations: FieldOperationRow[];
  },
): OpsTraceabilityEdge[] {
  const hasCluster =
    linked.incidenciasIds.size > 0 ||
    linked.requerimientoIds.size > 0 ||
    linked.operationIds.size > 0;
  if (!hasCluster) return [];

  const edges: OpsTraceabilityEdge[] = [];
  const seen = new Set<string>();

  const addEdge = (
    a: OpsAnchor,
    b: OpsAnchor,
    kind: OpsTraceabilityEdgeKind,
  ) => {
    const [from, to] = orderAnchors(a, b);
    const key = `${kind}:${from.kind}:${from.id}:${to.kind}:${to.id}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ from, to, kind });
  };

  for (const inc of data.incidencias) {
    if (!linked.incidenciasIds.has(inc.id)) continue;
    for (const req of data.requerimientos) {
      if (!linked.requerimientoIds.has(req.id)) continue;
      if (req.incidenciaId === inc.id || inc.requerimientoId === req.id) {
        addEdge(
          { kind: 'inc', id: inc.id },
          { kind: 'req', id: req.id },
          'inc-req',
        );
      }
    }
  }

  for (const req of data.requerimientos) {
    if (!linked.requerimientoIds.has(req.id)) continue;
    for (const op of data.operations) {
      if (!linked.operationIds.has(op.id)) continue;
      if (operationLinksToRequerimiento(req, op)) {
        addEdge(
          { kind: 'req', id: req.id },
          { kind: 'op', id: op.id },
          'req-op',
        );
      }
    }
  }

  for (const inc of data.incidencias) {
    if (!linked.incidenciasIds.has(inc.id)) continue;
    for (const op of data.operations) {
      if (!linked.operationIds.has(op.id)) continue;
      if (!operationLinksToIncidencia(inc, op, data.requerimientos)) continue;
      if (hasCompleteReqPath(inc.id, op.id, edges)) continue;
      addEdge(
        { kind: 'inc', id: inc.id },
        { kind: 'op', id: op.id },
        'inc-op',
      );
    }
  }

  return edges;
}
