import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeIntervalCommand } from '../commands';
import { JokesService } from '../jokes.service';

@CommandHandler(ChangeIntervalCommand)
export class ChangeIntervalHandler implements ICommandHandler<ChangeIntervalCommand> {
  constructor(private readonly jokesService: JokesService) {}

  async execute(command: ChangeIntervalCommand): Promise<void> {
    this.jokesService.changeInterval(command.challenge, command.intervalSec);
  }
}
