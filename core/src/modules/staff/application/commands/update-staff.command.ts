export type UpdateStaffInput = {
  unit?: string;
  ds97Profile?: string | null;
  inspectorQualityStatus?: string;
  appointmentAt?: string | null;
  priorToLaw?: boolean;
  employeeNumber?: string | null;
  workEmail?: string | null;
  status?: string;
  forceGrant?: boolean;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  nationality?: string | null;
  profession?: string | null;
};

export class UpdateStaffCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: UpdateStaffInput,
  ) {}
}
