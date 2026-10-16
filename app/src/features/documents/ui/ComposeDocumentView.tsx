'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Alert, BasicPageLayout, Button, Select, TextField } from '@felipechandiadev/ui';
import { apiBase } from '@/lib/api/core-fetch';
import { canWriteDocumentTypes } from '@/shared/auth/user-roles';
import {
  DocxDocumentEditor,
  type DocxDocumentEditorHandle,
} from '@/features/documents/ui/DocxDocumentEditor';
import {
  loadDocxTemplate,
  templateIdForDocumentType,
} from '@/features/documents/ui/docx-templates';
import { useUnsavedChanges } from '@/features/documents/ui/use-unsaved-changes';
import type { DocumentTypeRow } from '@/features/documents/ui/document-types';

type Props = {
  documentTypes: DocumentTypeRow[];
  role?: string | null;
};

export function ComposeDocumentView({ documentTypes, role }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const token = session?.user?.accessToken;
  const canWrite = canWriteDocumentTypes(role);
  const editorRef = useRef<DocxDocumentEditorHandle>(null);

  const [title, setTitle] = useState('');
  const [typeCode, setTypeCode] = useState<string | null>(null);
  const [docBuffer, setDocBuffer] = useState<ArrayBuffer | null>(null);
  const [docKey, setDocKey] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useUnsavedChanges(dirty);

  const typeOptions = documentTypes
    .filter((t) => t.status === 'active' && t.creationMode === 'composed')
    .map((t) => ({ id: t.code, label: t.name }));

  async function applyTemplate(code: string | null) {
    const id = templateIdForDocumentType(code);
    const buf = await loadDocxTemplate(id);
    setDocBuffer(buf);
    setDocKey((k) => k + 1);
    setDirty(false);
  }

  useEffect(() => {
    let cancelled = false;
    loadDocxTemplate('blank')
      .then((buf) => {
        if (!cancelled) setDocBuffer(buf);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Error al cargar plantilla',
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onTypeChange(id: string | number | null) {
    const next = id == null ? null : String(id);
    if (dirty) {
      const ok = window.confirm(
        'Hay cambios sin guardar. ¿Cargar la plantilla del tipo seleccionado y descartar el contenido actual?',
      );
      if (!ok) return;
    }
    setTypeCode(next);
    setError(null);
    try {
      await applyTemplate(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plantilla');
    }
  }

  async function save() {
    if (!token || !canWrite) return;
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!typeCode) {
      setError('Selecciona un tipo de documento');
      return;
    }

    setBusy(true);
    setError(null);
    setSavedMsg(null);
    try {
      const bytes = (await editorRef.current?.save()) ?? docBuffer;
      if (!bytes) {
        throw new Error('No se pudo exportar el documento Word');
      }

      const createRes = await fetch(`${apiBase()}/api/documents/reports`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          documentTypeCode: typeCode,
          status: 'draft',
        }),
      });
      const created = await createRes.json().catch(() => null);
      if (!createRes.ok) {
        throw new Error(
          Array.isArray(created?.message)
            ? created.message.join(', ')
            : (created?.message ?? `Error ${createRes.status}`),
        );
      }
      const code = created?.code as string | undefined;
      if (!code) throw new Error('Respuesta sin código de documento');

      const form = new FormData();
      form.append(
        'file',
        new Blob([new Uint8Array(bytes)], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        }),
        `${code}.docx`,
      );
      const bodyRes = await fetch(
        `${apiBase()}/api/documents/reports/${encodeURIComponent(code)}/body`,
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
            : (bodyData?.message ?? `Error al subir DOCX ${bodyRes.status}`),
        );
      }

      setDirty(false);
      setSavedMsg('Documento creado.');
      router.push(`/documents/reports/${encodeURIComponent(code)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setBusy(false);
    }
  }

  if (!canWrite) {
    return (
      <BasicPageLayout title="Redactar" subtitle="Nuevo documento">
        <Alert variant="info">
          Solo dirección, prevención o administrativo pueden redactar documentos.
        </Alert>
        <p className="mt-3">
          <Link href="/documents/library" className="underline">
            Ir a Biblioteca
          </Link>
        </p>
      </BasicPageLayout>
    );
  }

  return (
    <BasicPageLayout
      title="Redactar"
      subtitle="Nuevo documento Word"
      data-test-id="documents-compose"
      headerActions={
        <Button
          type="button"
          onClick={save}
          disabled={busy || !token || !title.trim() || !typeCode || !docBuffer}
        >
          {busy ? 'Guardando…' : 'Guardar'}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="m-0 text-sm">
          <Link
            href="/documents/library"
            className="hover:underline"
            onClick={(e) => {
              if (dirty) {
                const ok = window.confirm(
                  'Hay cambios sin guardar. ¿Salir de todos modos?',
                );
                if (!ok) e.preventDefault();
              }
            }}
          >
            ← Biblioteca
          </Link>
          {dirty ? (
            <span className="ml-2 text-muted-foreground">· Sin guardar</span>
          ) : null}
        </p>
        <div className="grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2">
          <TextField
            label="Título"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            required
            className="sm:col-span-2"
          />
          <Select
            label="Tipo de documento"
            options={typeOptions}
            value={typeCode}
            onChange={onTypeChange}
            placeholder="Seleccionar…"
          />
        </div>

        {typeOptions.length === 0 ? (
          <Alert variant="info">
            No hay tipos con modo «en sistema». Configúralos en Tipos.
          </Alert>
        ) : null}

        <p className="m-0 text-xs text-muted-foreground">
          Usa Archivo → Abrir en el editor para importar un .docx local. Al
          cambiar el tipo se aplica la plantilla (memo / informe / en blanco).
        </p>

        <DocxDocumentEditor
          key={docKey}
          ref={editorRef}
          documentBuffer={docBuffer}
          author={session?.user?.name ?? session?.user?.username ?? undefined}
          allowFileOpen
          onDirtyChange={setDirty}
          onOpenFile={async (file) => {
            if (!file.name.toLowerCase().endsWith('.docx')) {
              setError('Solo se admiten archivos .docx');
              return;
            }
            const buf = await file.arrayBuffer();
            setDocBuffer(buf);
            setDocKey((k) => k + 1);
            setDirty(true);
            setError(null);
          }}
        />

        {error ? (
          <p className="m-0 text-sm text-[var(--color-destructive,#b91c1c)]">
            {error}
          </p>
        ) : null}
        {savedMsg ? (
          <p className="m-0 text-sm text-muted-foreground">{savedMsg}</p>
        ) : null}
      </div>
    </BasicPageLayout>
  );
}
