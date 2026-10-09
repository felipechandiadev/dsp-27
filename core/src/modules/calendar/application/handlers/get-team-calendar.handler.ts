import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  USER_REPOSITORY,
  UserRepositoryPort,
} from '@modules/users/application/ports/user.repository.port';
import { GetTeamCalendarQuery } from '../queries/get-team-calendar.query';
import { DSP_AGENDA, DspAgendaPort } from '../ports/dsp-agenda.port';
import {
  TEAM_CALENDAR_GRAPH,
  TeamCalendarGraphPort,
} from '../ports/team-calendar-graph.port';
import { TeamCalendarEvent } from '../../domain/team-calendar.types';

@QueryHandler(GetTeamCalendarQuery)
export class GetTeamCalendarHandler
  implements IQueryHandler<GetTeamCalendarQuery>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepositoryPort,
    @Inject(DSP_AGENDA)
    private readonly dspAgenda: DspAgendaPort,
    @Inject(TEAM_CALENDAR_GRAPH)
    private readonly graph: TeamCalendarGraphPort,
  ) {}

  async execute(query: GetTeamCalendarQuery) {
    const allUsers = await this.users.listActiveWithPerson();
    const byPersona = new Map(
      allUsers.map((u) => [
        u.personaId,
        {
          userId: u.id,
          displayName: u.person
            ? `${u.person.firstName} ${u.person.lastName}`.trim()
            : u.username,
          email: u.person?.email?.trim() || null,
        },
      ]),
    );

    let personIds = query.personIds;
    if (!personIds || personIds.length === 0) {
      personIds = allUsers.map((u) => u.personaId);
    }

    const events: TeamCalendarEvent[] = [];
    const warnings: string[] = [];
    const layers = query.layers.length
      ? query.layers
      : (['dsp', 'outlook'] as const);

    if (layers.includes('dsp')) {
      const items = await this.dspAgenda.listAssignedTasksInRange(
        query.from,
        query.to,
        personIds,
      );
      for (const item of items) {
        const person = byPersona.get(item.personId);
        events.push({
          id: `dsp:task:${item.taskId}:${item.personId}`,
          layer: 'dsp',
          personId: item.personId,
          userId: person?.userId ?? null,
          displayName: person?.displayName ?? 'Sin nombre',
          title: item.title,
          start: `${item.startsOn}T00:00:00`,
          end: `${item.endsOn}T23:59:59`,
          allDay: true,
          location: null,
          busyOnly: false,
          sourceRef: { taskId: item.taskId },
        });
      }
    }

    if (layers.includes('outlook')) {
      if (!this.graph.isConfigured()) {
        warnings.push(
          'Overlay Outlook no configurado (MS_APP_ONLY_CALENDAR / credenciales).',
        );
      } else {
        const targets = personIds
          .map((pid) => {
            const p = byPersona.get(pid);
            if (!p?.email) return null;
            return { personId: pid, ...p };
          })
          .filter(
            (
              x,
            ): x is {
              personId: string;
              userId: string;
              displayName: string;
              email: string;
            } => Boolean(x?.email),
          );

        const concurrency = 5;
        for (let i = 0; i < targets.length; i += concurrency) {
          const chunk = targets.slice(i, i + concurrency);
          const results = await Promise.all(
            chunk.map(async (t) => {
              try {
                const list = await this.graph.listCalendarView(
                  t.email,
                  query.from,
                  query.to,
                );
                return { t, list, error: null as string | null };
              } catch (err) {
                return {
                  t,
                  list: [],
                  error: err instanceof Error ? err.message : String(err),
                };
              }
            }),
          );
          for (const r of results) {
            if (r.error) {
              warnings.push(
                `Outlook ${r.t.displayName} (${r.t.email}): ${r.error}`,
              );
              continue;
            }
            for (const ev of r.list) {
              const busyOnly = ev.isPrivate;
              events.push({
                id: `outlook:${r.t.userId}:${ev.id}`,
                layer: 'outlook',
                personId: r.t.personId,
                userId: r.t.userId,
                displayName: r.t.displayName,
                title: busyOnly ? 'Ocupado' : ev.subject || '(sin título)',
                start: ev.start,
                end: ev.end,
                allDay: ev.allDay,
                location: busyOnly ? null : ev.location,
                busyOnly,
                sourceRef: { outlookEventId: ev.id },
              });
            }
          }
        }
      }
    }

    events.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    return {
      from: query.from,
      to: query.to,
      outlookConfigured: this.graph.isConfigured(),
      events,
      warnings,
    };
  }
}
