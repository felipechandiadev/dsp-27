'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  EntityDetailLayout,
  EntityDetailSectionNav,
} from '@felipechandiadev/ui';
import { StaffIdentityPhoto } from '@/features/staff/ui/StaffIdentityPhoto';
import { StaffPersonProfileForm } from '@/features/staff/ui/StaffPersonProfileForm';
import { StaffRequirementChecklist } from '@/features/staff/ui/StaffRequirementChecklist';
import {
  STAFF_DETAIL_TABS,
  staffDetailSectionFromHash,
  type StaffDetail,
  type StaffDetailSectionId,
} from '@/features/staff/ui/staff-detail.types';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </span>
      <span className="truncate text-sm">{value}</span>
    </div>
  );
}

type Props = {
  staff: StaffDetail;
  canEdit: boolean;
};

export function StaffDetailView({ staff, canEdit }: Props) {
  const [activeSection, setActiveSection] =
    useState<StaffDetailSectionId>('datos');

  useEffect(() => {
    const fromHash = staffDetailSectionFromHash(window.location.hash);
    if (fromHash) setActiveSection(fromHash);
  }, []);

  const selectSection = useCallback((id: string) => {
    const sectionId = id as StaffDetailSectionId;
    setActiveSection(sectionId);
    const nextHash = `#${sectionId}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${nextHash}`,
      );
    }
  }, []);

  const fullName = staff.person
    ? `${staff.person.firstName} ${staff.person.lastName}`
    : staff.code;

  return (
    <EntityDetailLayout
      title={`${staff.code} — ${fullName}`}
      meta={
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{staff.status}</Badge>
          <Badge variant="secondary">{staff.inspectorQualityStatus}</Badge>
          <Link href="/staff" className="hover:underline text-sm">
            Volver al listado
          </Link>
        </div>
      }
      sectionNav={
        <EntityDetailSectionNav
          tabs={STAFF_DETAIL_TABS}
          activeId={activeSection}
          onSelect={selectSection}
          ariaLabel="Secciones del personal"
          idPrefix="staff"
        />
      }
      idPrefix="staff"
      activeSectionId={activeSection}
      data-test-id="staff-detail-root"
    >
      {activeSection === 'datos' ? (
        <div
          className="max-w-4xl rounded-lg border border-[var(--color-border)] bg-[var(--color-card,var(--color-background))] p-4 sm:p-5"
          data-test-id="staff-section-datos"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex shrink-0 flex-col items-center gap-2 sm:w-[9.5rem]">
              <StaffIdentityPhoto
                code={staff.code}
                avatarAssetId={staff.avatarAssetId}
                canEdit={canEdit}
              />
              <p className="m-0 text-center font-mono text-xs text-[var(--color-muted-foreground)]">
                {staff.code}
              </p>
            </div>

            <div className="min-w-0 flex-1 flex flex-col gap-3">
              {staff.person ? (
                <>
                  <div className="flex flex-col gap-0.5 border-b border-[var(--color-border)] pb-3">
                    <p className="m-0 text-lg font-semibold tracking-tight">
                      {fullName}
                    </p>
                    <p className="m-0 text-sm text-[var(--color-muted-foreground)]">
                      {staff.person.documentType}{' '}
                      {staff.person.documentNumber}
                    </p>
                  </div>
                  {canEdit ? (
                    <StaffPersonProfileForm
                      code={staff.code}
                      person={staff.person}
                    />
                  ) : (
                    <div
                      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                      data-test-id="staff-person-profile-readonly"
                    >
                      <InfoRow label="Correo" value={staff.person.email ?? '—'} />
                      <InfoRow
                        label="Teléfono"
                        value={staff.person.phone ?? '—'}
                      />
                      <InfoRow
                        label="Dirección"
                        value={staff.person.address ?? '—'}
                      />
                      <InfoRow
                        label="Región"
                        value={staff.person.state ?? '—'}
                      />
                      <InfoRow
                        label="Comuna"
                        value={staff.person.city ?? '—'}
                      />
                      <InfoRow
                        label="Estado civil"
                        value={staff.person.maritalStatus ?? '—'}
                      />
                      <InfoRow
                        label="Género"
                        value={staff.person.gender ?? '—'}
                      />
                      <InfoRow
                        label="Nacionalidad"
                        value={staff.person.nationality ?? '—'}
                      />
                      <InfoRow
                        label="Profesión"
                        value={staff.person.profession ?? '—'}
                      />
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm m-0 text-[var(--color-muted-foreground)]">
                  Sin persona
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {activeSection === 'laboral' ? (
        <dl
          className="m-0 grid max-w-3xl grid-cols-[8rem_1fr] gap-x-3 gap-y-1 text-sm"
          data-test-id="staff-section-laboral"
        >
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
      ) : null}

      {activeSection === 'checklist' ? (
        <div className="max-w-3xl" data-test-id="staff-section-checklist">
          <StaffRequirementChecklist
            code={staff.code}
            inspectorQualityStatus={staff.inspectorQualityStatus}
            readyForGrant={staff.readyForGrant}
            requirements={staff.requirements}
          />
        </div>
      ) : null}

      {activeSection === 'tareas' ? (
        <ul
          className="m-0 p-0 list-none flex flex-col gap-2 max-w-3xl"
          data-test-id="staff-section-tareas"
        >
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
      ) : null}

      {activeSection === 'actividad' ? (
        <ul
          className="m-0 p-0 list-none flex flex-col gap-3 max-w-3xl"
          data-test-id="staff-section-actividad"
        >
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
      ) : null}
    </EntityDetailLayout>
  );
}
