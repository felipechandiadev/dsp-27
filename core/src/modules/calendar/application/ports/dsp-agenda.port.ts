export const DSP_AGENDA = Symbol('DSP_AGENDA');

export type DspAgendaItem = {
  taskId: string;
  title: string;
  personId: string;
  startsOn: string;
  endsOn: string;
};

export interface DspAgendaPort {
  listAssignedTasksInRange(
    from: string,
    to: string,
    personIds: string[] | null,
  ): Promise<DspAgendaItem[]>;
}
