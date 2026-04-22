import { Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { CommandBus } from '@nestjs/cqrs';
import { Subscription } from 'rxjs';
import { Server, Socket } from 'socket.io';
import { StartJokesCommand, StopJokesCommand, ChangeIntervalCommand } from './commands';
import { JokesService } from './jokes.service';

interface CustomQuery {
  challenge: string;
  [key: string]: string | string[] | undefined;
}

interface AuthenticatedSocket extends Socket {
  handshake: Socket['handshake'] & { query: CustomQuery };
}

@WebSocketGateway({ namespace: 'jokes', cors: { origin: '*' } })
export class JokesGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(JokesGateway.name);
  private jokeSub!: Subscription;

  constructor(
    private readonly commandBus: CommandBus,
    private readonly jokesService: JokesService,
  ) {}

  onModuleInit() {
    this.jokeSub = this.jokesService.joke$.subscribe(({ challenge, joke }) => {
      this.server.to(challenge).emit('joke', joke);
    });
  }

  onModuleDestroy() {
    this.jokeSub?.unsubscribe();
  }

  async handleConnection(@ConnectedSocket() client: AuthenticatedSocket) {
    const challenge = client.handshake.query.challenge;
    this.logger.log(`Client connected: ${challenge}`);
    if (!challenge) {
      client.disconnect();
      return;
    }
    await client.join(challenge);
  }

  handleDisconnect(@ConnectedSocket() client: AuthenticatedSocket) {
    const challenge = client.handshake.query.challenge;
    this.logger.log(`Client disconnected: ${challenge}`);
    if (challenge) {
      this.commandBus.execute(new StopJokesCommand(challenge));
    }
  }

  @SubscribeMessage('start')
  handleStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { intervalSec: number; sources?: string[] },
  ) {
    const challenge = client.handshake.query.challenge;
    this.commandBus.execute(
      new StartJokesCommand(challenge, data.intervalSec ?? 5, data.sources ?? ['joke-api']),
    );
  }

  @SubscribeMessage('stop')
  handleStop(@ConnectedSocket() client: AuthenticatedSocket) {
    const challenge = client.handshake.query.challenge;
    this.commandBus.execute(new StopJokesCommand(challenge));
  }

  @SubscribeMessage('change-interval')
  handleChangeInterval(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { intervalSec: number },
  ) {
    const challenge = client.handshake.query.challenge;
    this.commandBus.execute(new ChangeIntervalCommand(challenge, data.intervalSec));
  }
}
