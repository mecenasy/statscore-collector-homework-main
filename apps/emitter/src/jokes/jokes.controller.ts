import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StartJokesCommand, StopJokesCommand, ChangeIntervalCommand } from './commands';

@Controller()
export class JokesController {
  constructor(private readonly commandBus: CommandBus) {}

  @EventPattern('start')
  handleStart(
    @Payload() data: { challenge: string; intervalSec: number; sources: string[] },
  ) {
    this.commandBus.execute(
      new StartJokesCommand(data.challenge, data.intervalSec ?? 5, data.sources ?? ['joke-api']),
    );
  }

  @EventPattern('stop')
  handleStop(@Payload() data: { challenge: string }) {
    this.commandBus.execute(new StopJokesCommand(data.challenge));
  }

  @EventPattern('change-interval')
  handleChangeInterval(@Payload() data: { challenge: string; intervalSec: number }) {
    this.commandBus.execute(new ChangeIntervalCommand(data.challenge, data.intervalSec));
  }
}
