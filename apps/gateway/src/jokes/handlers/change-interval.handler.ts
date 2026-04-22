import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ClientProxy } from '@nestjs/microservices';
import { ChangeIntervalCommand } from '../commands';

@CommandHandler(ChangeIntervalCommand)
export class ChangeIntervalHandler implements ICommandHandler<ChangeIntervalCommand> {
  private readonly logger = new Logger(ChangeIntervalHandler.name);

  constructor(@Inject('EMITTER_CLIENT') private readonly client: ClientProxy) {}

  async execute(command: ChangeIntervalCommand): Promise<void> {
    this.logger.log(`[change-interval] dispatching to emitter: challenge=${command.challenge}, intervalSec=${command.intervalSec}`);
    this.client.emit('change-interval', {
      challenge: command.challenge,
      intervalSec: command.intervalSec,
    });
  }
}
