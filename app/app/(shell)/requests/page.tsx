import { Alert, BasicPageLayout, Card } from '@felipechandiadev/ui';

export default function RequestsPage() {
  return (
    <BasicPageLayout
      title="Solicitudes"
      subtitle="Ingresos y trámites de ventanilla única"
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
