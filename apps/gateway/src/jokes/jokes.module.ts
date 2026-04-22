import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JokesGateway } from './jokes.gateway';
import { JokesService } from './jokes.service';
import { JokesEventsController } from './jokes.events.controller';
import { JokesHttpController } from './jokes.http.controller';
import { SourceRegistryService } from './sources';
import { StartJokesHandler, StopJokesHandler, ChangeIntervalHandler } from './handlers';

const CommandHandlers = [StartJokesHandler, StopJokesHandler, ChangeIntervalHandler];

@Global()
@Module({
  imports: [
    CqrsModule,
    ClientsModule.register([
      {
        name: 'EMITTER_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env['RABBITMQ_URL'] ?? 'amqp://localhost:5672'],
          queue: 'jokes_commands',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [JokesEventsController, JokesHttpController],
  providers: [JokesGateway, JokesService, SourceRegistryService, ...CommandHandlers],
  exports: [JokesGateway],
})
export class JokesModule {}
