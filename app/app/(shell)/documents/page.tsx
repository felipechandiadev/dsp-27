import Link from 'next/link';
import { BasicPageLayout, Card } from '@felipechandiadev/ui';
import { BookOpen, FileEdit, Library, Tags } from 'lucide-react';

const SECTIONS = [
  {
    href: '/documents/compose',
    title: 'Redactar',
    description: 'Crear documentos en el editor (informes, memos, actas…).',
    icon: FileEdit,
  },
  {
    href: '/documents/library',
    title: 'Biblioteca',
    description: 'Listado de documentos gestionados (managed_documents).',
    icon: Library,
  },
  {
    href: '/documents/norms',
    title: 'Normativa',
    description: 'Marco normativo Cap. 1 — catálogo y PDF oficiales.',
    icon: BookOpen,
  },
  {
    href: '/documents/types',
    title: 'Tipos',
    description: 'Catálogo maestro y modo de creación (en sistema / adjunto).',
    icon: Tags,
  },
] as const;

export default function DocumentsHubPage() {
  return (
    <BasicPageLayout
      title="Documentos"
      subtitle="Gestión documental de la Dirección"
      data-test-id="documents-hub"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="no-underline text-inherit"
            >
              <Card
                fillHeight
                className="cursor-pointer h-full hover:border-[var(--color-primary)] transition-colors"
                title={
                  <span className="inline-flex items-center gap-2">
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {s.title}
                  </span>
                }
              >
                <p className="m-0 text-sm text-[var(--color-muted-foreground)]">
                  {s.description}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </BasicPageLayout>
  );
}
