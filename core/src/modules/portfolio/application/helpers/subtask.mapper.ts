import { Subtask } from '../../domain/subtask.entity';
import { mapObjectiveCodes } from './strategic-objectives.helper';

export function mapSubtask(s: Subtask) {
  return {
    id: s.id,
    taskId: s.taskId,
    title: s.title,
    description: s.description,
    objectiveText: s.objectiveText,
    status: s.status,
    startsOn: s.startsOn,
    endsOn: s.endsOn,
    sortOrder: s.sortOrder,
    locationAccuracyM: s.locationAccuracyM,
    locatedAt: s.locatedAt,
    strategicObjectives: mapObjectiveCodes(s.strategicObjectives),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}
