import { getServerSession } from 'next-auth';
import { Alert, BasicPageLayout } from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import type { CalendarPerson } from '@/features/calendar/lib/types';
import { TeamCalendarView } from '@/features/calendar/ui/team-calendar-view';

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  const { data, ok } = await coreFetch<{
    people: CalendarPerson[];
    outlookConfigured: boolean;
  }>('/api/calendar/people', session?.user?.accessToken);

  const people = data?.people ?? [];
  const outlookConfigured = data?.outlookConfigured ?? false;

  return (
    <BasicPageLayout
      title="Calendario"
      subtitle="Agenda de equipo — mes, capas DSP y Outlook"
    >
      {!ok ? (
        <Alert variant="warning">
          No se pudo contactar al core para el directorio. La grilla se muestra
          igual; reinicia el API si hace falta.
        </Alert>
      ) : null}
      <TeamCalendarView
        initialPeople={people}
        outlookConfigured={outlookConfigured}
      />
    </BasicPageLayout>
  );
}
