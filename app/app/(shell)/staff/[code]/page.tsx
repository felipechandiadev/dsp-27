import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import { Badge, BasicPageLayout, Card } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { StaffRequirementChecklist } from '@/features/staff/ui/StaffRequirementChecklist';
import { StaffAvatar } from '@/features/staff/ui/StaffAvatar';

type StaffDetail = {
  id: string;
  code: string;
  unit: string;
  ds97Profile: string | null;
  inspectorQualityStatus: string;
  appointmentAt: string | null;
  priorToLaw: boolean;
  employeeNumber: string | null;
  workEmail: string | null;
  status: string;
  readyForGrant: boolean;
  avatarAssetId: string | null;
  person: {
    id: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
    email: string | null;
    phone: string | null;
  } | null;
  requirements: Array<{
    id: string;
    requirementCode: string;
    status: string;
    notes: string | null;
  }>;
  tasks: Array<{
    taskId: string;
    taskCode: string | null;
    title: string;
    status: string;
    projectCode: string | null;
    projectTitle: string | null;
    assignmentRole: string;
    assignedAt: string;
  }>;
  activity: Array<{
    kind: 'note' | 'assignment';
    at: string;
    summary: string;
    entityType: string | null;
    entityId: string | null;
    taskCode: string | null;
    projectCode: string | null;
  }>;
};

async function fetchStaff(
  code: string,
  accessToken?: string,
): Promise<StaffDetail | null> {
  const { ok, status, data } = await coreFetch<StaffDetail>(
    `/api/staff/${encodeURIComponent(code)}`,
    accessToken,
  );
  if (status === 404 || !ok || !data) return null;
  return data;
}

function initialsOf(first?: string, last?: string, code?: string): string {
  const a = (first?.[0] ?? '').toUpperCase();
  const b = (last?.[0] ?? '').toUpperCase();
  if (a || b) return `${a}${b}` || code?.slice(0, 2) || '?';
  return (code ?? '?').slice(0, 2).toUpperCase();
}

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const session = await getServerSession(authOptions);
  const staff = await fetchStaff(code, session?.user?.accessToken);
  if (!staff) notFound();

  const fullName = staff.person
    ? `${staff.person.firstName} ${staff.person.lastName}`
    : staff.code;
  const role = session?.user?.role;
  const canEdit =
    role === 'direccion' ||
    role === 'administrativo' ||
    role === 'jefe_operaciones';

  return (
    <BasicPageLayout
      title={`${staff.code} — ${fullName}`}
      subtitle={
        <>
          <Badge variant="secondary">{staff.status}</Badge>{' '}
          <Badge variant="secondary">{staff.inspectorQualityStatus}</Badge>{' '}
          <Link href="/staff" className="hover:underline text-sm">
            Volver al listado
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-3 max-w-3xl">
        <Card title="Identidad">
          <div className="flex flex-col gap-3">
            <StaffAvatar
              code={staff.code}
              avatarAssetId={staff.avatarAssetId}
              initials={initialsOf(
                staff.person?.firstName,
                staff.person?.lastName,
                staff.code,
              )}
              canEdit={canEdit}
            />
            {staff.person ? (
              <div className="text-sm flex flex-col gap-1">
                <p className="m-0 font-medium">{fullName}</p>
                <p className="m-0 text-[var(--color-muted-foreground)]">
                  {staff.person.documentType} {staff.person.documentNumber}
                </p>
                {staff.person.email ? (
                  <p className="m-0 text-[var(--color-muted-foreground)]">
                    {staff.person.email}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm m-0 text-[var(--color-muted-foreground)]">
                Sin persona
              </p>
            )}
          </div>
        </Card>

        <Card title="Laboral">
          <dl className="m-0 grid grid-cols-[8rem_1fr] gap-x-3 gap-y-1 text-sm">
            <dt className="text-[var(--color-muted-foreground)]">Unidad</dt>
            <dd className="m-0">{staff.unit}</dd>
            <dt className="text-[var(--color-muted-foreground)]">DS 97</dt>
            <dd className="m-0">{staff.ds97Profile ?? '—'}</dd>
            <dt className="text-[var(--color-muted-foreground)]">Folio</dt>
            <dd className="m-0">{staff.employeeNumber ?? '—'}</dd>
            <dt className="text-[var(--color-muted-foreground)]">Nombramiento</dt>
            <dd className="m-0">{staff.appointmentAt ?? '—'}</dd>
            <dt className="text-[var(--color-muted-foreground)]">Pre-ley</dt>
            <dd className="m-0">{staff.priorToLaw ? 'sí' : 'no'}</dd>
            <dt className="text-[var(--color-muted-foreground)]">Email lab.</dt>
            <dd className="m-0">{staff.workEmail ?? '—'}</dd>
          </dl>
        </Card>

        <Card title="Checklist art. 12°">
          <StaffRequirementChecklist
            code={staff.code}
            inspectorQualityStatus={staff.inspectorQualityStatus}
            readyForGrant={staff.readyForGrant}
            requirements={staff.requirements}
          />
        </Card>

        <Card
          title="Tareas responsables"
          subtitle={`${staff.tasks?.length ?? 0}`}
        >
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {(staff.tasks ?? []).map((t) => (
              <li key={t.taskId} className="text-sm flex flex-wrap items-center gap-2">
                {t.projectCode ? (
                  <Link
                    href={`/projects/${t.projectCode}`}
                    className="font-medium hover:underline"
                  >
                    {t.taskCode ?? t.title}
                  </Link>
                ) : (
                  <strong>{t.taskCode ?? t.title}</strong>
                )}
                <span className="text-[var(--color-muted-foreground)]">
                  {t.title}
                </span>
                <Badge variant="secondary">{t.status}</Badge>
                <Badge variant="info">{t.assignmentRole}</Badge>
              </li>
            ))}
            {!staff.tasks?.length ? (
              <li className="text-sm text-[var(--color-muted-foreground)]">
                Sin tareas asignadas.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card
          title="Actividad reciente"
          subtitle={`${staff.activity?.length ?? 0}`}
        >
          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {(staff.activity ?? []).map((a, i) => (
              <li
                key={`${a.kind}-${a.at}-${i}`}
                className="text-sm border-l-2 border-[var(--color-border)] pl-2"
              >
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <Badge variant="secondary">{a.kind}</Badge>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {new Date(a.at).toLocaleString('es-CL')}
                  </span>
                  {a.projectCode ? (
                    <Link
                      href={`/projects/${a.projectCode}`}
                      className="text-xs hover:underline"
                    >
                      {a.projectCode}
                      {a.taskCode ? ` · ${a.taskCode}` : ''}
                    </Link>
                  ) : null}
                </div>
                <p className="m-0 text-[var(--color-muted-foreground)]">
                  {a.summary}
                </p>
              </li>
            ))}
            {!staff.activity?.length ? (
              <li className="text-sm text-[var(--color-muted-foreground)]">
                Sin actividad registrada.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </BasicPageLayout>
  );
}
