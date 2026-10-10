'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Alert,
  Button,
  Dialog,
  IconButton,
  Select,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import {
  canCloseRequerimiento,
  canCreateOperationalCase,
  canDeployOperation,
  canVerifyIncidencia,
} from '@/shared/auth/user-roles';
import type {
  CatalogType,
  FieldOperationRow,
  IncidenciaRow,
  RequerimientoRow,
} from './ops-types';
import { PRIORITY_OPTIONS, priorityLabel } from './ops-types';
import {
  computeOpsTraceabilityEdges,
  opsAnchorKey,
  type OpsEntityKind,
} from './compute-ops-traceability-edges';
import { OpsIncidenciaCard } from './OpsIncidenciaCard';
import { OpsRequerimientoCard } from './OpsRequerimientoCard';
import { OpsOperacionCard } from './OpsOperacionCard';
import { OpsTriageConnectorOverlay } from './OpsTriageConnectorOverlay';
import './ops-triage.css';

type Props = {
  initialIncidencias: IncidenciaRow[];
  initialRequerimientos: RequerimientoRow[];
  initialOperations: FieldOperationRow[];
  incidentTypes: CatalogType[];
  operationTypes: CatalogType[];
};

type MobileTab = 'inc' | 'req' | 'op';

type Selection =
  | { kind: 'inc'; id: string }
  | { kind: 'req'; id: string }
  | { kind: 'op'; id: string }
  | null;

function apiError(data: unknown, fallback: string): string {
  const msg = (data as { message?: string | string[] } | null)?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string') return msg;
  return fallback;
}

export function OperationalTriageBoard({
  initialIncidencias,
  initialRequerimientos,
  initialOperations,
  incidentTypes,
  operationTypes,
}: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const role = session?.user?.role;
  const canCreate = canCreateOperationalCase(role);
  const canVerify = canVerifyIncidencia(role);
  const canDeploy = canDeployOperation(role);
  const canClose = canCloseRequerimiento(role);

  const [incidencias, setIncidencias] = useState(initialIncidencias);
  const [requerimientos, setRequerimientos] = useState(initialRequerimientos);
  const [operations, setOperations] = useState(initialOperations);
  const [types, setTypes] = useState(incidentTypes);
  const [selection, setSelection] = useState<Selection>(null);
  const [expanded, setExpanded] = useState<Selection>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>('req');
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [typeDialogError, setTypeDialogError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [createIncOpen, setCreateIncOpen] = useState(false);
  const [createReqOpen, setCreateReqOpen] = useState(false);
  const [createTypeOpen, setCreateTypeOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [closeReqOpen, setCloseReqOpen] = useState(false);

  const [incTitle, setIncTitle] = useState('');
  const [incDesc, setIncDesc] = useState('');
  const [incTypeId, setIncTypeId] = useState<string | number | null>(null);
  const [newTypeName, setNewTypeName] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqPriority, setReqPriority] = useState<string | number | null>('P2');
  const [reqIncidenciaId, setReqIncidenciaId] = useState<
    string | number | null
  >(null);
  const [deployTrigger, setDeployTrigger] = useState<string | number | null>(
    'requerimiento',
  );
  const [deployTypeId, setDeployTypeId] = useState<string | number | null>(
    null,
  );
  const [deployBriefing, setDeployBriefing] = useState('');
  const [deployReqId, setDeployReqId] = useState<string | number | null>(null);
  const [deployIncId, setDeployIncId] = useState<string | number | null>(null);
  const [closeStatus, setCloseStatus] = useState<string | number | null>(
    'resuelto',
  );
  const [closeReason, setCloseReason] = useState('');
  const [closeTargetCode, setCloseTargetCode] = useState<string | null>(null);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const anchorsRef = useRef(new Map<string, HTMLElement>());
  const layoutNotifyRafRef = useRef(0);

  const notifyLayoutChange = useCallback(() => {
    if (layoutNotifyRafRef.current) return;
    layoutNotifyRafRef.current = window.requestAnimationFrame(() => {
      layoutNotifyRafRef.current = 0;
      setLayoutVersion((v) => v + 1);
    });
  }, []);

  const registerAnchor = useCallback(
    (kind: OpsEntityKind, id: string, el: HTMLElement | null) => {
      const key = opsAnchorKey(kind, id);
      if (el) anchorsRef.current.set(key, el);
      else anchorsRef.current.delete(key);
    },
    [],
  );

  const getAnchorElement = useCallback(
    (kind: OpsEntityKind, id: string) =>
      anchorsRef.current.get(opsAnchorKey(kind, id)),
    [],
  );

  const linked = useMemo(() => {
    const incidenciasIds = new Set<string>();
    const requerimientoIds = new Set<string>();
    const operationIds = new Set<string>();
    if (!selection) {
      return { incidenciasIds, requerimientoIds, operationIds };
    }
    if (selection.kind === 'inc') {
      incidenciasIds.add(selection.id);
      const inc = incidencias.find((i) => i.id === selection.id);
      if (inc?.requerimientoId) requerimientoIds.add(inc.requerimientoId);
      for (const r of requerimientos) {
        if (r.incidenciaId === selection.id) requerimientoIds.add(r.id);
      }
      for (const op of operations) {
        if (op.incidenciaId === selection.id) operationIds.add(op.id);
        if (op.requerimientoId && requerimientoIds.has(op.requerimientoId)) {
          operationIds.add(op.id);
        }
      }
    } else if (selection.kind === 'req') {
      requerimientoIds.add(selection.id);
      const req = requerimientos.find((r) => r.id === selection.id);
      if (req?.incidenciaId) incidenciasIds.add(req.incidenciaId);
      for (const i of incidencias) {
        if (i.requerimientoId === selection.id) incidenciasIds.add(i.id);
      }
      for (const op of operations) {
        if (op.requerimientoId === selection.id) operationIds.add(op.id);
        if (req?.incidenciaId && op.incidenciaId === req.incidenciaId) {
          operationIds.add(op.id);
        }
      }
    } else {
      operationIds.add(selection.id);
      const op = operations.find((o) => o.id === selection.id);
      if (op?.requerimientoId) requerimientoIds.add(op.requerimientoId);
      if (op?.incidenciaId) incidenciasIds.add(op.incidenciaId);
      if (op?.requerimientoId) {
        const req = requerimientos.find((r) => r.id === op.requerimientoId);
        if (req?.incidenciaId) incidenciasIds.add(req.incidenciaId);
      }
      for (const i of incidencias) {
        if (op?.requerimientoId && i.requerimientoId === op.requerimientoId) {
          incidenciasIds.add(i.id);
        }
      }
    }
    return { incidenciasIds, requerimientoIds, operationIds };
  }, [selection, incidencias, requerimientos, operations]);

  const traceabilityEdges = useMemo(
    () =>
      computeOpsTraceabilityEdges(linked, {
        incidencias,
        requerimientos,
        operations,
      }),
    [linked, incidencias, requerimientos, operations],
  );

  useEffect(() => {
    notifyLayoutChange();
  }, [selection, expanded, notifyLayoutChange]);

  async function authed(
    path: string,
    init?: RequestInit,
  ): Promise<{ ok: boolean; status: number; data: unknown }> {
    if (!token) {
      return {
        ok: false,
        status: 401,
        data: { message: 'Sesión no disponible. Vuelve a iniciar sesión.' },
      };
    }
    const res = await fetch(`${apiBase()}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    const data = await res.json().catch(() => null);
    if (res.status === 401) {
      return {
        ok: false,
        status: 401,
        data: {
          message:
            'Sesión expirada. Cierra sesión y vuelve a entrar para crear registros.',
        },
      };
    }
    return { ok: res.ok, status: res.status, data };
  }

  async function createIncidencia(e: FormEvent) {
    e.preventDefault();
    const title = incTitle.trim();
    if (!title) {
      setDialogError('El título es requerido');
      return;
    }
    setPending(true);
    setDialogError(null);
    setError(null);
    const { ok, data } = await authed('/api/operational-cases/incidencias', {
      method: 'POST',
      body: JSON.stringify({
        title,
        descripcion: incDesc.trim() || undefined,
        incidentTypeId: incTypeId ? String(incTypeId) : undefined,
      }),
    });
    setPending(false);
    if (!ok) {
      setDialogError(apiError(data, 'No se pudo crear la incidencia'));
      return;
    }
    setIncidencias((prev) => [data as IncidenciaRow, ...prev]);
    setCreateIncOpen(false);
    setIncTitle('');
    setIncDesc('');
    setIncTypeId(null);
    setDialogError(null);
    router.refresh();
  }

  async function createRequerimiento(e: FormEvent) {
    e.preventDefault();
    if (!reqDesc.trim()) {
      setDialogError('La descripción es requerida');
      return;
    }
    setPending(true);
    setDialogError(null);
    setError(null);
    const { ok, data } = await authed('/api/operational-cases/requerimientos', {
      method: 'POST',
      body: JSON.stringify({
        descripcion: reqDesc.trim(),
        prioridad: reqPriority ? String(reqPriority) : 'P2',
        incidenciaId: reqIncidenciaId ? String(reqIncidenciaId) : undefined,
      }),
    });
    setPending(false);
    if (!ok) {
      setDialogError(apiError(data, 'No se pudo crear el requerimiento'));
      return;
    }
    const created = data as RequerimientoRow;
    setRequerimientos((prev) => [created, ...prev]);
    if (created.incidenciaId) {
      setIncidencias((prev) =>
        prev.map((i) =>
          i.id === created.incidenciaId
            ? { ...i, requerimientoId: created.id }
            : i,
        ),
      );
    }
    setCreateReqOpen(false);
    setReqDesc('');
    setReqIncidenciaId(null);
    setDialogError(null);
    router.refresh();
  }

  async function verifyInc(code: string, status: string) {
    setPending(true);
    setError(null);
    const { ok, data } = await authed(
      `/api/operational-cases/incidencias/${encodeURIComponent(code)}/verification`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    );
    setPending(false);
    if (!ok) {
      setError(apiError(data, 'No se pudo actualizar verificación'));
      return;
    }
    const updated = data as IncidenciaRow;
    setIncidencias((prev) =>
      prev.map((i) => (i.code === updated.code ? updated : i)),
    );
  }

  async function setReqEnGestion(code: string) {
    setPending(true);
    setError(null);
    const { ok, data } = await authed(
      `/api/operational-cases/requerimientos/${encodeURIComponent(code)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status: 'en_gestion' }) },
    );
    setPending(false);
    if (!ok) {
      setError(apiError(data, 'No se pudo actualizar estado'));
      return;
    }
    const updated = data as RequerimientoRow;
    setRequerimientos((prev) =>
      prev.map((r) => (r.code === updated.code ? updated : r)),
    );
  }

  async function closeReq(e: FormEvent) {
    e.preventDefault();
    if (!closeTargetCode) return;
    setPending(true);
    setError(null);
    const { ok, data } = await authed(
      `/api/operational-cases/requerimientos/${encodeURIComponent(closeTargetCode)}/close`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: closeStatus ? String(closeStatus) : 'resuelto',
          reason: closeReason.trim() || undefined,
        }),
      },
    );
    setPending(false);
    if (!ok) {
      setError(apiError(data, 'No se pudo cerrar'));
      return;
    }
    const updated = data as RequerimientoRow;
    setRequerimientos((prev) =>
      prev.map((r) => (r.code === updated.code ? updated : r)),
    );
    setCloseReqOpen(false);
    setCloseTargetCode(null);
    setCloseReason('');
  }

  async function deployOp(e: FormEvent) {
    e.preventDefault();
    const trigger = String(deployTrigger || 'requerimiento');
    if (trigger === 'requerimiento' && !deployReqId) {
      setDialogError('Selecciona un requerimiento');
      return;
    }
    if (trigger === 'incidencia' && !deployIncId) {
      setDialogError('Selecciona una incidencia');
      return;
    }
    setPending(true);
    setDialogError(null);
    setError(null);
    const { ok, data } = await authed('/api/operational-cases/operations', {
      method: 'POST',
      body: JSON.stringify({
        triggerType: trigger,
        operationTypeId: deployTypeId ? String(deployTypeId) : undefined,
        briefing: deployBriefing.trim() || undefined,
        requerimientoId:
          trigger === 'requerimiento' && deployReqId
            ? String(deployReqId)
            : undefined,
        incidenciaId:
          trigger === 'incidencia' && deployIncId
            ? String(deployIncId)
            : undefined,
      }),
    });
    setPending(false);
    if (!ok) {
      setDialogError(apiError(data, 'No se pudo desplegar'));
      return;
    }
    setOperations((prev) => [data as FieldOperationRow, ...prev]);
    setDeployOpen(false);
    setDeployBriefing('');
    setDialogError(null);
    router.refresh();
  }

  async function patchOpStatus(code: string, status: string) {
    setPending(true);
    setError(null);
    const { ok, data } = await authed(
      `/api/operational-cases/operations/${encodeURIComponent(code)}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    );
    setPending(false);
    if (!ok) {
      setError(apiError(data, 'No se pudo cambiar estado'));
      return;
    }
    const updated = data as FieldOperationRow;
    setOperations((prev) =>
      prev.map((o) => (o.code === updated.code ? updated : o)),
    );
  }

  async function createIncidentType(e: FormEvent) {
    e.preventDefault();
    const name = newTypeName.trim();
    if (!name) {
      setTypeDialogError('El nombre es requerido');
      return;
    }
    setPending(true);
    setTypeDialogError(null);
    const { ok, data } = await authed(
      '/api/operational-cases/incident-types',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
    );
    setPending(false);
    if (!ok) {
      setTypeDialogError(apiError(data, 'No se pudo crear el tipo'));
      return;
    }
    const created = data as CatalogType;
    setTypes((prev) =>
      [...prev, created].sort(
        (a, b) =>
          a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'es'),
      ),
    );
    setIncTypeId(created.id);
    setCreateTypeOpen(false);
    setNewTypeName('');
    setTypeDialogError(null);
    router.refresh();
  }

  const typeOptions = types.map((t) => ({ id: t.id, label: t.name }));
  const opTypeOptions = operationTypes.map((t) => ({
    id: t.id,
    label: t.name,
  }));
  const priorityOptions = [...PRIORITY_OPTIONS];
  const incLinkOptions = incidencias.map((i) => ({
    id: i.id,
    label: `${i.code} — ${i.title}`,
  }));
  const reqLinkOptions = requerimientos
    .filter((r) => !r.closedAt)
    .map((r) => ({
      id: r.id,
      label: `${r.code} — ${priorityLabel(r.prioridad)}`,
    }));

  const nextOp: Record<string, string[]> = {
    asignada: ['en_traslado', 'ejecutando', 'cancelada'],
    en_traslado: ['ejecutando', 'cancelada', 'fallida'],
    ejecutando: ['finalizada', 'cancelada', 'fallida'],
  };

  const column = (key: MobileTab) => {
    return (
      <div
        className={`ops-col ops-col--${key}`}
        data-ops-column-scroll
        style={{
          display: 'grid',
          gap: '0.5rem',
          alignContent: 'start',
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <strong style={{ fontSize: '0.95rem' }}>
            {key === 'inc'
              ? 'Incidencias'
              : key === 'req'
                ? 'Requerimientos'
                : 'Operaciones'}
          </strong>
          {key === 'inc' && canCreate ? (
            <IconButton
              icon="Plus"
              variant="action"
              size="md"
              ariaLabel="Nueva incidencia"
              onClick={() => {
                setError(null);
                setDialogError(null);
                setCreateIncOpen(true);
              }}
            />
          ) : null}
          {key === 'req' && canCreate ? (
            <IconButton
              icon="Plus"
              variant="action"
              size="md"
              ariaLabel="Nuevo requerimiento"
              onClick={() => {
                setError(null);
                setDialogError(null);
                setCreateReqOpen(true);
              }}
            />
          ) : null}
          {key === 'op' && canDeploy ? (
            <IconButton
              icon="Plus"
              variant="action"
              size="md"
              ariaLabel="Desplegar operación"
              onClick={() => {
                setError(null);
                setDialogError(null);
                setDeployOpen(true);
              }}
            />
          ) : null}
        </div>

        {key === 'inc' &&
          (incidencias.length === 0 ? (
            <Alert variant="info">Sin incidencias.</Alert>
          ) : (
            incidencias.map((i) => {
              const active = selection?.kind === 'inc' && selection.id === i.id;
              const hit = linked.incidenciasIds.has(i.id);
              const isExpanded =
                expanded?.kind === 'inc' && expanded.id === i.id;
              return (
                <OpsIncidenciaCard
                  key={i.id}
                  incidencia={i}
                  incidentTypes={types}
                  focused={active}
                  linked={hit && !active}
                  expanded={isExpanded}
                  canEdit={canCreate}
                  canVerify={canVerify}
                  pending={pending}
                  onSelect={() => setSelection({ kind: 'inc', id: i.id })}
                  onToggleExpand={() =>
                    setExpanded(isExpanded ? null : { kind: 'inc', id: i.id })
                  }
                  onUpdated={(updated) =>
                    setIncidencias((prev) =>
                      prev.map((row) =>
                        row.code === updated.code ? updated : row,
                      ),
                    )
                  }
                  onVerify={verifyInc}
                  registerAnchor={registerAnchor}
                  onLayoutChange={notifyLayoutChange}
                  authed={authed}
                />
              );
            })
          ))}

        {key === 'req' &&
          (requerimientos.length === 0 ? (
            <Alert variant="info">Sin requerimientos.</Alert>
          ) : (
            requerimientos.map((r) => {
              const active = selection?.kind === 'req' && selection.id === r.id;
              const hit = linked.requerimientoIds.has(r.id);
              const isExpanded =
                expanded?.kind === 'req' && expanded.id === r.id;
              return (
                <OpsRequerimientoCard
                  key={r.id}
                  requerimiento={r}
                  focused={active}
                  linked={hit && !active}
                  expanded={isExpanded}
                  canEdit={canCreate}
                  canClose={canClose}
                  pending={pending}
                  onSelect={() => setSelection({ kind: 'req', id: r.id })}
                  onToggleExpand={() =>
                    setExpanded(isExpanded ? null : { kind: 'req', id: r.id })
                  }
                  onUpdated={(updated) =>
                    setRequerimientos((prev) =>
                      prev.map((row) =>
                        row.code === updated.code ? updated : row,
                      ),
                    )
                  }
                  onEnGestion={setReqEnGestion}
                  onClose={(code) => {
                    setCloseTargetCode(code);
                    setCloseReqOpen(true);
                  }}
                  registerAnchor={registerAnchor}
                  onLayoutChange={notifyLayoutChange}
                  authed={authed}
                />
              );
            })
          ))}

        {key === 'op' &&
          (operations.length === 0 ? (
            <Alert variant="info">Sin operaciones activas.</Alert>
          ) : (
            operations.map((o) => {
              const active = selection?.kind === 'op' && selection.id === o.id;
              const hit = linked.operationIds.has(o.id);
              const isExpanded =
                expanded?.kind === 'op' && expanded.id === o.id;
              const next = nextOp[o.status] ?? [];
              return (
                <OpsOperacionCard
                  key={o.id}
                  operation={o}
                  focused={active}
                  linked={hit && !active}
                  expanded={isExpanded}
                  canEdit={canDeploy}
                  pending={pending}
                  nextStatuses={next}
                  onSelect={() => setSelection({ kind: 'op', id: o.id })}
                  onToggleExpand={() =>
                    setExpanded(isExpanded ? null : { kind: 'op', id: o.id })
                  }
                  onUpdated={(updated) =>
                    setOperations((prev) =>
                      prev.map((row) =>
                        row.code === updated.code ? updated : row,
                      ),
                    )
                  }
                  onPatchStatus={patchOpStatus}
                  registerAnchor={registerAnchor}
                  onLayoutChange={notifyLayoutChange}
                  authed={authed}
                />
              );
            })
          ))}
      </div>
    );
  };

  return (
    <div className="ops-triage" style={{ display: 'grid', gap: '0.75rem' }}>
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="ops-mobile-tabs" style={{ display: 'none', gap: '0.35rem' }}>
        {(
          [
            ['inc', 'Incidencias'],
            ['req', 'Requerimientos'],
            ['op', 'Operaciones'],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            type="button"
            variant={mobileTab === id ? 'primary' : 'outlined'}
            onClick={() => setMobileTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="ops-board-wrap">
        <div
          ref={boardRef}
          className="ops-board"
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          }}
        >
          {column('inc')}
          {column('req')}
          {column('op')}
        </div>
        <OpsTriageConnectorOverlay
          boardRef={boardRef}
          edges={traceabilityEdges}
          selection={selection}
          layoutVersion={layoutVersion}
          getAnchorElement={getAnchorElement}
          active={selection != null}
        />
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ops-mobile-tabs { display: flex !important; flex-wrap: wrap; }
          .ops-board { grid-template-columns: 1fr !important; }
          .ops-col--inc { display: ${mobileTab === 'inc' ? 'grid' : 'none'} !important; }
          .ops-col--req { display: ${mobileTab === 'req' ? 'grid' : 'none'} !important; }
          .ops-col--op { display: ${mobileTab === 'op' ? 'grid' : 'none'} !important; }
        }
      `}</style>

      <Dialog
        open={createIncOpen}
        onClose={() => {
          setCreateIncOpen(false);
          setDialogError(null);
        }}
        title="Nueva incidencia"
      >
        <form onSubmit={createIncidencia} className="grid gap-3">
          {dialogError ? <Alert variant="error">{dialogError}</Alert> : null}
          <TextField
            label="Título"
            value={incTitle}
            onChange={(e) => setIncTitle(e.target.value)}
            required
          />
          <TextField
            label="Descripción"
            value={incDesc}
            onChange={(e) => setIncDesc(e.target.value)}
            rows={3}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: canCreate ? '1fr auto' : '1fr',
              gap: '0.5rem',
              alignItems: 'end',
            }}
          >
            <Select
              label="Tipo"
              options={typeOptions}
              value={incTypeId}
              onChange={setIncTypeId}
              allowClear
              placeholder="Opcional"
            />
            {canCreate ? (
              <IconButton
                icon="Plus"
                variant="action"
                size="md"
                ariaLabel="Nuevo tipo de incidencia"
                onClick={() => {
                  setTypeDialogError(null);
                  setCreateTypeOpen(true);
                }}
              />
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setCreateIncOpen(false);
                setDialogError(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Creando…' : 'Crear'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={createTypeOpen}
        onClose={() => {
          setCreateTypeOpen(false);
          setTypeDialogError(null);
        }}
        title="Nuevo tipo de incidencia"
        size="xs"
      >
        <form onSubmit={createIncidentType} className="grid gap-3">
          {typeDialogError ? (
            <Alert variant="error">{typeDialogError}</Alert>
          ) : null}
          <TextField
            label="Nombre"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setCreateTypeOpen(false);
                setTypeDialogError(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Creando…' : 'Crear tipo'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={createReqOpen}
        onClose={() => {
          setCreateReqOpen(false);
          setDialogError(null);
        }}
        title="Nuevo requerimiento"
      >
        <form onSubmit={createRequerimiento} className="grid gap-3">
          {dialogError ? <Alert variant="error">{dialogError}</Alert> : null}
          <TextField
            label="Descripción"
            value={reqDesc}
            onChange={(e) => setReqDesc(e.target.value)}
            rows={3}
            required
          />
          <Select
            label="Prioridad"
            options={priorityOptions}
            value={reqPriority}
            onChange={setReqPriority}
          />
          <Select
            label="Incidencia enlazada"
            options={incLinkOptions}
            value={reqIncidenciaId}
            onChange={setReqIncidenciaId}
            allowClear
            placeholder="Opcional"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setCreateReqOpen(false);
                setDialogError(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Creando…' : 'Crear'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={deployOpen}
        onClose={() => {
          setDeployOpen(false);
          setDialogError(null);
        }}
        title="Desplegar operación"
      >
        <form onSubmit={deployOp} className="grid gap-3">
          {dialogError ? <Alert variant="error">{dialogError}</Alert> : null}
          <Select
            label="Origen"
            options={[
              { id: 'requerimiento', label: 'Desde requerimiento' },
              { id: 'incidencia', label: 'Desde incidencia' },
              { id: 'leadership_instruction', label: 'Instrucción jefatura' },
            ]}
            value={deployTrigger}
            onChange={setDeployTrigger}
          />
          <Select
            label="Tipo de operación"
            options={opTypeOptions}
            value={deployTypeId}
            onChange={setDeployTypeId}
            allowClear
          />
          {deployTrigger === 'requerimiento' ? (
            <Select
              label="Requerimiento"
              options={reqLinkOptions}
              value={deployReqId}
              onChange={setDeployReqId}
              required
            />
          ) : null}
          {deployTrigger === 'incidencia' ? (
            <Select
              label="Incidencia"
              options={incLinkOptions}
              value={deployIncId}
              onChange={setDeployIncId}
              required
            />
          ) : null}
          <TextField
            label="Briefing"
            value={deployBriefing}
            onChange={(e) => setDeployBriefing(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                setDeployOpen(false);
                setDialogError(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Desplegando…' : 'Desplegar'}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={closeReqOpen}
        onClose={() => setCloseReqOpen(false)}
        title="Cerrar requerimiento"
      >
        <form onSubmit={closeReq} className="grid gap-3">
          <Select
            label="Resultado"
            options={[
              { id: 'resuelto', label: 'Resuelto' },
              { id: 'no_resuelto', label: 'No resuelto' },
              { id: 'descartado', label: 'Descartado' },
            ]}
            value={closeStatus}
            onChange={setCloseStatus}
          />
          <TextField
            label="Motivo"
            value={closeReason}
            onChange={(e) => setCloseReason(e.target.value)}
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outlined" onClick={() => setCloseReqOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={pending}>
              Cerrar
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
