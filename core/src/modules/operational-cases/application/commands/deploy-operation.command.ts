export type DeployOperationInput = {
  triggerType: string;
  operationTypeId?: string;
  prioridad?: string;
  briefing?: string;
  requerimientoId?: string;
  incidenciaId?: string;
  assignedStaffId?: string;
  areaId?: string;
};

export class DeployOperationCommand {
  constructor(
    public readonly actorRole: string,
    public readonly input: DeployOperationInput,
  ) {}
}
