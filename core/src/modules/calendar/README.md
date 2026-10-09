# Calendar (team agenda)

Dual-layer team calendar: DSP tasks + optional Outlook app-only overlay.

See `dev-docs/08-calendario-equipo.md`.

## REST

- `GET /calendar/people`
- `GET /calendar/team?from=&to=&personIds=&layers=dsp,outlook`

## Env

`MS_APP_ONLY_CALENDAR=true` + Application `Calendars.Read` (admin consent).
