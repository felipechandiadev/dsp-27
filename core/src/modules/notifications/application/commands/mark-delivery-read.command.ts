export class MarkDeliveryReadCommand {
  constructor(
    public readonly userId: string,
    public readonly deliveryId: string,
  ) {}
}
