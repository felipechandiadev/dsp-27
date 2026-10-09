export type CreateStaffInput = {
  unit: string;
  personaId?: string;
  documentType?: string;
  documentNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  ds97Profile?: string | null;
  appointmentAt?: string | null;
  priorToLaw?: boolean;
  employeeNumber?: string | null;
  workEmail?: string | null;
  status?: string;
};

export class CreateStaffCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly input: CreateStaffInput,
  ) {}
}
