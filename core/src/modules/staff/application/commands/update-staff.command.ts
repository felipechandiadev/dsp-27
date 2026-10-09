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
};

export class UpdateStaffCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly code: string,
    public readonly input: UpdateStaffInput,
  ) {}
}
