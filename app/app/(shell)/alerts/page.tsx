import { Alert, BasicPageLayout, Card } from '@felipechandiadev/ui';

export default function AlertsPage() {
  return (
    <BasicPageLayout title="Alertas" subtitle="Plazos e incidencias en tiempo real">
      <Card>
        <Alert variant="info">
          Módulo pendiente: WebSocket <code>/realtime/alerts</code> (paso 9 de la
          guía).
        </Alert>
      </Card>
    </BasicPageLayout>
  );
}
