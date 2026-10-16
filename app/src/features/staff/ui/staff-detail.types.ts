export type StaffDetailSectionId =
  | 'datos'
  | 'laboral'
  | 'checklist'
  | 'tareas'
  | 'actividad';

export type StaffDetailTabItem = {
  id: StaffDetailSectionId;
  label: string;
};

export const STAFF_DETAIL_TABS: StaffDetailTabItem[] = [
  { id: 'datos', label: 'Datos personales' },
  { id: 'laboral', label: 'Laboral' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'tareas', label: 'Tareas' },
  { id: 'actividad', label: 'Actividad' },
];

export function staffDetailSectionFromHash(
  hash: string,
): StaffDetailSectionId | null {
  const raw = hash.replace(/^#/, '').trim();
  // Legacy hash from previous "Resumen" tab
  if (raw === 'resumen') return 'datos';
  const id = raw as StaffDetailSectionId;
  return STAFF_DETAIL_TABS.some((t) => t.id === id) ? id : null;
}

export type StaffDetail = {
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
    address: string | null;
    city: string | null;
    state: string | null;
    maritalStatus: string | null;
    gender: string | null;
    nationality: string | null;
    profession: string | null;
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
