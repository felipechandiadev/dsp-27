import { Alert, BasicPageLayout, Card } from '@felipechandiadev/ui';

export default function SolicitudesPage() {
  return (
    <BasicPageLayout
      title="Solicitudes de ventanilla única"
      subtitle="Ingresos y trámites ciudadanos / municipales"
    >
      <Card>
        <Alert variant="info">
          Placeholder — ventanilla única. El listado, estados y flujo de
          atención se completarán en una siguiente iteración.
        </Alert>
      </Card>
    </BasicPageLayout>
  );
}
