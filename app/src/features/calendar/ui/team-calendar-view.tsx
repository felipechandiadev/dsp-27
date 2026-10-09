'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Alert, Button, Card } from '@felipechandiadev/ui';
import type {
  CalendarPerson,
  TeamCalendarEvent,
  TeamCalendarResponse,
} from '../lib/types';

function apiBase(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    'http://localhost:5080'
  );
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthBounds(year: number, monthIndex: number) {
  const last = new Date(year, monthIndex + 1, 0).getDate();
  return {
    from: `${year}-${pad2(monthIndex + 1)}-01`,
    to: `${year}-${pad2(monthIndex + 1)}-${pad2(last)}`,
  };
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function TeamCalendarView({
  initialPeople,
  outlookConfigured,
}: {
  initialPeople: CalendarPerson[];
  outlookConfigured: boolean;
}) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const now = new Date();
  const todayKey = localDateKey(now);

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const [layerDsp, setLayerDsp] = useState(true);
  const [layerOutlook, setLayerOutlook] = useState(outlookConfigured);
  const [selected, setSelected] = useState<string[]>(
    initialPeople.map((p) => p.personaId),
  );
  const [events, setEvents] = useState<TeamCalendarEvent[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { from, to } = useMemo(() => monthBounds(year, month), [year, month]);

  const layers = useMemo(() => {
    const list: string[] = [];
    if (layerDsp) list.push('dsp');
    if (layerOutlook) list.push('outlook');
    return list;
  }, [layerDsp, layerOutlook]);

  const load = useCallback(async () => {
    if (!token || layers.length === 0) {
      setEvents([]);
      setWarnings([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        from,
        to,
        layers: layers.join(','),
      });
      if (selected.length > 0 && selected.length < initialPeople.length) {
        params.set('personIds', selected.join(','));
      }
      const res = await fetch(
        `${apiBase()}/api/calendar/team?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        },
      );
      if (!res.ok) {
        setError('No se pudo cargar el calendario de equipo');
        setEvents([]);
        return;
      }
      const data = (await res.json()) as TeamCalendarResponse;
      setEvents(data.events ?? []);
      setWarnings(data.warnings ?? []);
    } catch {
      setError('Error de red al cargar el calendario');
    } finally {
      setLoading(false);
    }
  }, [token, from, to, layers, selected, initialPeople.length]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    // Keep selection inside the visible month
    if (selectedDay < from || selectedDay > to) {
      const preferToday = todayKey >= from && todayKey <= to;
      setSelectedDay(preferToday ? todayKey : from);
    }
  }, [from, to, selectedDay, todayKey]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, TeamCalendarEvent[]>();
    for (const ev of events) {
      const key = dayKey(ev.start);
      const list = map.get(key) ?? [];
      list.push(ev);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const gridCells = useMemo(() => {
    const first = new Date(year, month, 1);
    // Monday = 0 … Sunday = 6
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ key: string; day: number | null }> = [];
    for (let i = 0; i < startPad; i++) {
      cells.push({ key: `pad-${i}`, day: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${pad2(month + 1)}-${pad2(d)}`;
      cells.push({ key, day: d });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ key: `pad-end-${cells.length}`, day: null });
    }
    return cells;
  }, [year, month]);

  const selectedEvents = eventsByDay.get(selectedDay) ?? [];

  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric',
  });

  const selectedDayLabel = new Date(`${selectedDay}T12:00:00`).toLocaleDateString(
    'es-CL',
    { weekday: 'long', day: 'numeric', month: 'long' },
  );

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function goToday() {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(n.getMonth());
    setSelectedDay(localDateKey(n));
  }

  function togglePerson(personaId: string) {
    setSelected((prev) =>
      prev.includes(personaId)
        ? prev.filter((id) => id !== personaId)
        : [...prev, personaId],
    );
  }

  return (
    <div className="dsp-cal">
      {!outlookConfigured ? (
        <Alert variant="info">
          Overlay Outlook desactivado (
          <code>MS_APP_ONLY_CALENDAR</code>). Puedes usar la capa DSP y la
          grilla igual.
        </Alert>
      ) : null}

      <Card>
        <div className="dsp-cal__toolbar">
          <div className="dsp-cal__nav">
            <Button
              type="button"
              variant="outlined"
              size="sm"
              onClick={() => shiftMonth(-1)}
              aria-label="Mes anterior"
            >
              ‹
            </Button>
            <h2 className="dsp-cal__month">{monthLabel}</h2>
            <Button
              type="button"
              variant="outlined"
              size="sm"
              onClick={() => shiftMonth(1)}
              aria-label="Mes siguiente"
            >
              ›
            </Button>
            <Button type="button" variant="text" size="sm" onClick={goToday}>
              Hoy
            </Button>
          </div>

          <div className="dsp-cal__layers">
            <label className="dsp-cal__chip">
              <input
                type="checkbox"
                checked={layerDsp}
                onChange={(e) => setLayerDsp(e.target.checked)}
              />
              <span className="dsp-cal__dot dsp-cal__dot--dsp" />
              DSP
            </label>
            <label
              className={`dsp-cal__chip${outlookConfigured ? '' : ' is-disabled'}`}
            >
              <input
                type="checkbox"
                checked={layerOutlook}
                onChange={(e) => setLayerOutlook(e.target.checked)}
                disabled={!outlookConfigured}
              />
              <span className="dsp-cal__dot dsp-cal__dot--outlook" />
              Outlook
            </label>
          </div>
        </div>

        <div className="dsp-cal__people">
          <div className="dsp-cal__people-head">
            <span>Equipo</span>
            <button
              type="button"
              className="dsp-cal__linkish"
              onClick={() =>
                setSelected(initialPeople.map((p) => p.personaId))
              }
            >
              Todas
            </button>
            <button
              type="button"
              className="dsp-cal__linkish"
              onClick={() => setSelected([])}
            >
              Ninguna
            </button>
          </div>
          <div className="dsp-cal__people-list">
            {initialPeople.length === 0 ? (
              <span className="dsp-cal__muted">Sin usuarios activos</span>
            ) : (
              initialPeople.map((p) => (
                <label
                  key={p.personaId}
                  className={`dsp-cal__person${selected.includes(p.personaId) ? ' is-on' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.personaId)}
                    onChange={() => togglePerson(p.personaId)}
                  />
                  {p.displayName}
                </label>
              ))
            )}
          </div>
        </div>
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {warnings.slice(0, 3).map((w) => (
        <Alert key={w} variant="warning">
          {w}
        </Alert>
      ))}

      <Card>
        <div className="dsp-cal__grid-wrap" aria-busy={loading}>
          <div className="dsp-cal__weekdays">
            {WEEKDAYS.map((w) => (
              <div key={w} className="dsp-cal__weekday">
                {w}
              </div>
            ))}
          </div>
          <div className="dsp-cal__grid">
            {gridCells.map((cell) => {
              if (cell.day === null) {
                return (
                  <div key={cell.key} className="dsp-cal__cell is-empty" />
                );
              }
              const dayEvents = eventsByDay.get(cell.key) ?? [];
              const dspCount = dayEvents.filter((e) => e.layer === 'dsp').length;
              const outCount = dayEvents.filter(
                (e) => e.layer === 'outlook',
              ).length;
              const isSelected = cell.key === selectedDay;
              const isToday = cell.key === todayKey;
              return (
                <button
                  key={cell.key}
                  type="button"
                  className={`dsp-cal__cell${isSelected ? ' is-selected' : ''}${isToday ? ' is-today' : ''}`}
                  onClick={() => setSelectedDay(cell.key)}
                >
                  <span className="dsp-cal__daynum">{cell.day}</span>
                  <span className="dsp-cal__marks" aria-hidden>
                    {dspCount > 0 ? (
                      <span className="dsp-cal__mark dsp-cal__mark--dsp" />
                    ) : null}
                    {outCount > 0 ? (
                      <span className="dsp-cal__mark dsp-cal__mark--outlook" />
                    ) : null}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="dsp-cal__count">{dayEvents.length}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {loading ? (
            <p className="dsp-cal__loading">Actualizando eventos…</p>
          ) : null}
        </div>
      </Card>

      <Card>
        <div className="dsp-cal__detail-head">
          <h3 className="dsp-cal__detail-title">{selectedDayLabel}</h3>
          <span className="dsp-cal__muted">
            {selectedEvents.length} evento
            {selectedEvents.length === 1 ? '' : 's'}
          </span>
        </div>

        {selectedEvents.length === 0 ? (
          <div className="dsp-cal__empty">
            <p>Sin eventos este día.</p>
            <p className="dsp-cal__muted">
              La grilla ya está lista. Cuando asignes tareas con fechas (capa
              DSP) o actives Outlook de equipo, aparecerán aquí.
            </p>
          </div>
        ) : (
          <ul className="dsp-cal__events">
            {selectedEvents.map((ev) => (
              <li key={ev.id} className="dsp-cal__event">
                <div className="dsp-cal__event-meta">
                  <span
                    className={`dsp-cal__badge dsp-cal__badge--${ev.layer}`}
                  >
                    {ev.layer === 'dsp' ? 'DSP' : 'Outlook'}
                  </span>
                  <span className="dsp-cal__muted">{ev.displayName}</span>
                </div>
                <strong className="dsp-cal__event-title">{ev.title}</strong>
                {ev.location ? (
                  <span className="dsp-cal__muted">{ev.location}</span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
