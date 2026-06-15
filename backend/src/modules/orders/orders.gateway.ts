import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/orders',
})
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Get token from handshake auth or query
      const token = client.handshake.auth.token || client.handshake.query.token;
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'secretKey',
      });

      // Attach user info to socket
      client.data.user = payload;

      // Join staff to their tenant's order room
      if (payload.tenantId) {
        const roomName = `room:orders:${payload.tenantId}`;
        client.join(roomName);
      }
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup if needed
  }

  notifyOrderCreated(tenantId: string, orderData: any) {
    this.server.to(`room:orders:${tenantId}`).emit('order.created', orderData);
  }
}
