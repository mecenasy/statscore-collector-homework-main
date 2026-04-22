import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { StartJokesCommand } from '../commands';

@CommandHandler(StartJokesCommand)
export class StartJokesHandler implements ICommandHandler<StartJokesCommand> {
  constructor(@Inject('EMITTER_CLIENT') private readonly client: ClientProxy) {}

  async execute(command: StartJokesCommand): Promise<void> {
    this.client.emit('start', {
      challenge: command.challenge,
      intervalSec: command.intervalSec,
      sources: command.sources,
    });
  }
}
