'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Badge,
  Button,
  EntityDetailLayout,
  Select,
  TextField,
} from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { canWriteDocumentTypes } from '@/shared/auth/user-roles';
import {
  DocxDocumentEditor,
  type DocxDocumentEditorHandle,
} from '@/features/documents/ui/DocxDocumentEditor';
import { loadDocxTemplate } from '@/features/documents/ui/docx-templates';
import { useUnsavedChanges } from '@/features/documents/ui/use-unsaved-changes';
import {
  reportStatusLabel,
  type ManagedDocumentDetail,
} from '@/features/documents/ui/report-types';
import type { DocumentTypeRow } from '@/features/documents/ui/document-types';

type Props = {
  report: ManagedDocumentDetail;
  documentTypes: DocumentTypeRow[];
  role?: string | null;
};

export function ReportDetailView({ report, documentTypes, role }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;
  const canWrite = canWriteDocumentTypes(role);
  const editorRef = useRef<DocxDocumentEditorHandle>(null);

  const [title, setTitle] = useState(report.title);
  const [status, setStatus] = useState(report.status);
  const [typeCode, setTypeCode] = useState<string | null>(
    report.documentType?.code ?? null,
  );
  const [docBuffer, setDocBuffer] = useState<ArrayBuffer | null>(null);
  const [docKey, setDocKey] = useState(0);
  const [bodyAssetId, setBodyAssetId] = useState(report.bodyAssetId);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useUnsavedChanges(dirty && canWrite);

  const typeOptions = documentTypes
    .filter((t) => t.status === 'active')
    .map((t) => ({ id: t.code, label: t.name }));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (report.bodyAssetId && token) {
          const res = await fetch(
            `${apiBase()}/api/multimedia/${encodeURIComponent(report.bodyAssetId)}/content`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!res.ok) throw new Error('No se pudo cargar el DOCX');
          const buf = await res.arrayBuffer();
          if (!cancelled) {
            setDocBuffer(buf);
            setDocKey((k) => k + 1);
            setBodyAssetId(report.bodyAssetId);
          }
          return;
        }
        const blank = await loadDocxTemplate('blank');
        if (!cancelled) {
          setDocBuffer(blank);
          setDocKey((k) => k + 1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar documento',
          );
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [report.bodyAssetId, token]);

  async function uploadBody(bytes: ArrayBuffer) {
    if (!token) throw new Error('Sin sesión');
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(bytes)], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
      `${report.code}.docx`,
    );
    const bodyRes = await fetch(
      `${apiBase()}/api/documents/reports/${encodeURIComponent(report.code)}/body`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      },
    );
    const bodyData = await bodyRes.json().catch(() => null);
    if (!bodyRes.ok) {
      throw new Error(
        Array.isArray(bodyData?.message)
          ? bodyData.message.join(', ')
          : (bodyData?.message ?? `Error DOCX ${bodyRes.status}`),
      );
    }
    if (bodyData?.bodyAssetId) {
      setBodyAssetId(bodyData.bodyAssetId as string);
    }
    return bodyData;
  }

  async function save() {
    if (!token || !canWrite) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const metaRes = await fetch(
        `${apiBase()}/api/documents/reports/${encodeURIComponent(report.code)}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim(),
            status,
            documentTypeCode: typeCode,
          }),
        },
      );
      const metaData = await metaRes.json().catch(() => null);
      if (!metaRes.ok) {
        throw new Error(
          Array.isArray(metaData?.message)
            ? metaData.message.join(', ')
            : (metaData?.message ?? `Error ${metaRes.status}`),
        );
      }

      const bytes = await editorRef.current?.save();
      if (bytes) {
        await uploadBody(bytes);
      }

      setDirty(false);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setBusy(false);
    }
  }

  async function downloadDocx() {
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      let assetId = bodyAssetId;
      if (!assetId) {
        const bytes = await editorRef.current?.save();
        if (!bytes) throw new Error('No hay documento para descargar');
        const data = await uploadBody(bytes);
        assetId = (data?.bodyAssetId as string) ?? null;
      }
      if (!assetId) throw new Error('Documento sin archivo DOCX');

      const res = await fetch(
        `${apiBase()}/api/multimedia/${encodeURIComponent(assetId)}/content`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error('No se pudo descargar el DOCX');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.code}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <EntityDetailLayout
      title={report.title}
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm">{report.code}</span>
          <Badge
            variant={report.status === 'published' ? 'success' : 'secondary'}
          >
            {reportStatusLabel(report.status)}
          </Badge>
          {dirty ? (
            <span className="text-sm text-muted-foreground">Sin guardar</span>
          ) : null}
          <Link
            href="/documents/library"
            className="text-sm hover:underline"
            onClick={(e) => {
              if (dirty) {
                const ok = window.confirm(
                  'Hay cambios sin guardar. ¿Salir de todos modos?',
                );
                if (!ok) e.preventDefault();
              }
            }}
          >
            Volver a Biblioteca
          </Link>
        </div>
      }
      headerActions={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outlined"
            onClick={downloadDocx}
            disabled={busy || !token || (!bodyAssetId && !docBuffer)}
          >
            Descargar .docx
          </Button>
          {canWrite ? (
            <Button type="button" onClick={save} disabled={busy || !token}>
              {busy ? 'Guardando…' : 'Guardar'}
            </Button>
          ) : null}
        </div>
      }
      data-test-id="report-detail-root"
    >
      <div className="flex flex-col gap-4">
        {canWrite ? (
          <div className="grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Título"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
              className="sm:col-span-2"
            />
            <Select
              label="Tipo"
              options={typeOptions}
              value={typeCode}
              onChange={(id) => {
                setTypeCode(id == null ? null : String(id));
                setDirty(true);
              }}
              allowClear
              placeholder="Sin tipo"
            />
            <Select
              label="Estado"
              options={[
                { id: 'draft', label: 'Borrador' },
                { id: 'published', label: 'Publicado' },
              ]}
              value={status}
              onChange={(id) => {
                setStatus(id == null ? 'draft' : String(id));
                setDirty(true);
              }}
            />
          </div>
        ) : (
          <p className="m-0 text-sm text-muted-foreground">
            {report.documentType?.name ?? 'Sin tipo'}
          </p>
        )}

        {!bodyAssetId ? (
          <Alert variant="info">
            Este documento aún no tiene cuerpo DOCX. Al guardar se creará uno.
          </Alert>
        ) : null}

        <DocxDocumentEditor
          key={docKey}
          ref={editorRef}
          documentBuffer={docBuffer}
          readOnly={!canWrite}
          author={session?.user?.name ?? session?.user?.username ?? undefined}
          onDirtyChange={setDirty}
        />

        {error ? (
          <p className="m-0 text-sm text-[var(--color-destructive,#b91c1c)]">
            {error}
          </p>
        ) : null}
        {saved ? (
          <p className="m-0 text-sm text-muted-foreground">Guardado.</p>
        ) : null}
      </div>
    </EntityDetailLayout>
  );
}
