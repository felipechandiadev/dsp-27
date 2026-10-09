import { Alert, BasicPageLayout, Card } from '@felipechandiadev/ui';

export default function StaffPage() {
  return (
    <BasicPageLayout
      title="Personal y nómina"
      subtitle="Expediente, calidad de inspector/a, nómina trimestral"
    >
      <Card>
        <Alert variant="info">
          Placeholder — módulo <code>staff</code> / nómina art. 15° (paso 10).
        </Alert>
      </Card>
    </BasicPageLayout>
  );
}
