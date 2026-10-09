import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '@modules/auth/domain/jwt-payload';

@WebSocketGateway({
  namespace: '/realtime/notifications',
  cors: { origin: true, credentials: true },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.headers.authorization?.replace(/^Bearer\s+/i, '') as
          | string
          | undefined);
      if (!token) {
        client.disconnect(true);
        return;
      }
      const payload = await this.jwt.verifyAsync<JwtPayload>(token);
      if (!payload?.sub) {
        client.disconnect(true);
        return;
      }
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      await client.join(`user:${payload.sub}`);
      if (payload.role) {
        await client.join(`role:${payload.role}`);
      }
    } catch (err) {
      this.logger.debug(`WS auth failed: ${(err as Error).message}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(_client: Socket): void {
    // no-op
  }
}
