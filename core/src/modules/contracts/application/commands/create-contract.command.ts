export class CreateContractCommand {
  constructor(
    public readonly actorUserId: string,
    public readonly actorRole: string,
    public readonly input: {
      kind: string;
      title: string;
      contractorRut: string;
      contractorName: string;
      contractorEmail?: string | null;
      contractorPhone?: string | null;
      itsUserId: string;
      projectId?: string | null;
      startsOn: string;
      endsOn?: string | null;
      notes?: string | null;
      status?: string;
    },
  ) {}
}
