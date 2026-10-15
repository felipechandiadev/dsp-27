import { Alert, BasicPageLayout, Card } from '@felipechandiadev/ui';

export default function FondoFijoPage() {
  return (
    <BasicPageLayout
      title="Fondo fijo"
      subtitle="Caja chica y movimientos del fondo fijo municipal"
    >
      <Card>
        <Alert variant="info">
          Placeholder — fondo fijo. El registro de movimientos, saldos y
          rendiciones se completará en una siguiente iteración.
        </Alert>
      </Card>
    </BasicPageLayout>
  );
}
