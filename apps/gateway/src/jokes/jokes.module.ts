import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { JokesGateway } from './jokes.gateway';
import { JokesService } from './jokes.service';
import { StartJokesHandler, StopJokesHandler, ChangeIntervalHandler } from './handlers/';

const CommandHandlers = [StartJokesHandler, StopJokesHandler, ChangeIntervalHandler];

@Global()
@Module({
  imports: [CqrsModule, HttpModule],
  providers: [JokesGateway, JokesService, ...CommandHandlers],
  exports: [JokesGateway],
})
export class JokesModule {}
