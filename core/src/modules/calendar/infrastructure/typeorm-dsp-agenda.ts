import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '@modules/portfolio/domain/task.entity';
import { TaskAssignee } from '@modules/portfolio/domain/task-assignee.entity';
import {
  DspAgendaItem,
  DspAgendaPort,
} from '../application/ports/dsp-agenda.port';

@Injectable()
export class TypeOrmDspAgenda implements DspAgendaPort {
  constructor(
    @InjectRepository(TaskAssignee)
    private readonly assignees: Repository<TaskAssignee>,
  ) {}

  async listAssignedTasksInRange(
    from: string,
    to: string,
    personIds: string[] | null,
  ): Promise<DspAgendaItem[]> {
    const qb = this.assignees
      .createQueryBuilder('a')
      .innerJoin(Task, 't', 't.id = a.task_id AND t.deleted_at IS NULL')
      .where('a.unassigned_at IS NULL')
      .andWhere('a.person_id IS NOT NULL')
      .andWhere('a.task_id IS NOT NULL')
      .andWhere(
        `(t.starts_on IS NOT NULL OR t.ends_on IS NOT NULL)`,
      )
      .andWhere(
        `(COALESCE(t.starts_on, t.ends_on) <= :to AND COALESCE(t.ends_on, t.starts_on) >= :from)`,
        { from, to },
      )
      .select([
        'a.person_id AS "personId"',
        't.id AS "taskId"',
        't.title AS "title"',
        't.starts_on AS "startsOn"',
        't.ends_on AS "endsOn"',
      ]);

    if (personIds && personIds.length > 0) {
      qb.andWhere('a.person_id IN (:...personIds)', { personIds });
    }

    const rows = await qb.getRawMany<{
      personId: string;
      taskId: string;
      title: string;
      startsOn: string | null;
      endsOn: string | null;
    }>();

    return rows
      .map((r) => {
        const startsOn = r.startsOn || r.endsOn;
        const endsOn = r.endsOn || r.startsOn;
        if (!startsOn || !endsOn) return null;
        return {
          personId: r.personId,
          taskId: r.taskId,
          title: r.title,
          startsOn: String(startsOn).slice(0, 10),
          endsOn: String(endsOn).slice(0, 10),
        };
      })
      .filter((x): x is DspAgendaItem => x !== null);
  }
}
