import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JokesController } from './jokes.controller';
import { JokesService } from './jokes.service';
import { JokeApiSource } from './sources';
import { StartJokesHandler, StopJokesHandler, ChangeIntervalHandler } from './handlers';

const CommandHandlers = [StartJokesHandler, StopJokesHandler, ChangeIntervalHandler];

@Module({
  imports: [
    CqrsModule,
    HttpModule,
    ClientsModule.register([
      {
        name: 'GATEWAY_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env['RABBITMQ_URL'] ?? 'amqp://localhost:5672'],
          queue: 'jokes_events',
          queueOptions: { durable: false },
        },
      },
    ]),
  ],
  controllers: [JokesController],
  providers: [
    JokesService,
    JokeApiSource,
    {
      provide: 'JOKE_SOURCES',
      useFactory: (src: JokeApiSource) => [src],
      inject: [JokeApiSource],
    },
    ...CommandHandlers,
  ],
})
export class JokesModule {}
