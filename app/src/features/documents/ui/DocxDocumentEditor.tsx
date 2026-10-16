'use client';

import dynamic from 'next/dynamic';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import type { DocxEditorRef } from '@betteroffice/docx-react';
import '@betteroffice/docx-react/styles.css';
import { ensureDocxFontsConfigured } from '@/features/documents/ui/configure-docx-fonts';
import {
  DOCX_EDITOR_FONTS,
  DOCX_FONT_FAMILIES,
} from '@/features/documents/ui/docx-fonts';

type Props = {
  documentBuffer: ArrayBuffer | Uint8Array | null;
  onSave?: (buffer: ArrayBuffer) => void | Promise<void>;
  onDirtyChange?: (dirty: boolean) => void;
  onOpenFile?: (file: File) => void | Promise<void>;
  allowFileOpen?: boolean;
  readOnly?: boolean;
  author?: string;
  className?: string;
};

export type DocxDocumentEditorHandle = {
  save: () => Promise<ArrayBuffer | null>;
};

const DocxEditorLazy = dynamic(
  () => import('@betteroffice/docx-react').then((m) => m.DocxEditor),
  {
    ssr: false,
    loading: () => (
      <div className="dsp-docx-shell flex items-center justify-center text-sm text-muted-foreground">
        Cargando editor Word…
      </div>
    ),
  },
);

export const DocxDocumentEditor = forwardRef<DocxDocumentEditorHandle, Props>(
  function DocxDocumentEditor(
    {
      documentBuffer,
      onSave,
      onDirtyChange,
      onOpenFile,
      allowFileOpen = false,
      readOnly = false,
      author,
      className,
    },
    ref,
  ) {
    const [ready, setReady] = useState(false);
    const editorRef = useRef<DocxEditorRef | null>(null);
    const dirtyRef = useRef(false);

    useEffect(() => {
      ensureDocxFontsConfigured();
      setReady(true);
    }, []);

    useEffect(() => {
      // Nuevo buffer = punto limpio
      dirtyRef.current = false;
      onDirtyChange?.(false);
    }, [documentBuffer, onDirtyChange]);

    useImperativeHandle(ref, () => ({
      save: async () => {
        const bytes = await editorRef.current?.save();
        if (bytes) {
          dirtyRef.current = false;
          onDirtyChange?.(false);
        }
        return bytes ?? null;
      },
    }));

    if (!ready || !documentBuffer) {
      return (
        <div
          className={`dsp-docx-shell flex items-center justify-center text-sm text-muted-foreground ${className ?? ''}`}
          data-test-id="docx-document-editor"
        >
          {documentBuffer ? 'Cargando editor Word…' : 'Preparando documento…'}
        </div>
      );
    }

    return (
      <div
        className={`dsp-docx-shell ${className ?? ''}`}
        data-test-id="docx-document-editor"
      >
        <DocxEditorLazy
          ref={editorRef}
          documentBuffer={documentBuffer}
          readOnly={readOnly}
          mode={readOnly ? 'viewing' : 'editing'}
          author={author}
          downloadOnSave={false}
          showFileOpen={allowFileOpen && !readOnly}
          showHelpMenu={false}
          showZoomControl
          showRuler
          rulerUnit="cm"
          colorMode="light"
          fonts={[...DOCX_EDITOR_FONTS]}
          fontFamilies={[...DOCX_FONT_FAMILIES]}
          onOpen={
            allowFileOpen && onOpenFile
              ? async (file) => {
                  await onOpenFile(file);
                  dirtyRef.current = true;
                  onDirtyChange?.(true);
                }
              : undefined
          }
          onChange={() => {
            if (!dirtyRef.current) {
              dirtyRef.current = true;
              onDirtyChange?.(true);
            }
          }}
          onSave={(buffer) => {
            dirtyRef.current = false;
            onDirtyChange?.(false);
            void onSave?.(buffer);
          }}
          style={{ height: '100%', minHeight: '70vh' }}
        />
      </div>
    );
  },
);
