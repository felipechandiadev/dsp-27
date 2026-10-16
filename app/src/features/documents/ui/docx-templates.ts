/** Plantillas DOCX estáticas en /public/templates */

export type DocxTemplateId = 'blank' | 'memo' | 'informe';

export function templateIdForDocumentType(
  typeCode: string | null | undefined,
): DocxTemplateId {
  if (!typeCode) return 'blank';
  if (typeCode === 'memo') return 'memo';
  if (typeCode === 'informe' || typeCode === 'informe_servicio') {
    return 'informe';
  }
  return 'blank';
}

export async function loadDocxTemplate(
  id: DocxTemplateId,
): Promise<ArrayBuffer> {
  const res = await fetch(`/templates/${id}.docx`);
  if (!res.ok) {
    throw new Error(`No se pudo cargar la plantilla ${id}`);
  }
  return res.arrayBuffer();
}

/** @deprecated usar loadDocxTemplate('blank') */
export async function loadBlankDocxTemplate(): Promise<ArrayBuffer> {
  return loadDocxTemplate('blank');
}
