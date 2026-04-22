import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StartJokesCommand } from '../commands';
import { JokesService } from '../jokes.service';

@CommandHandler(StartJokesCommand)
export class StartJokesHandler implements ICommandHandler<StartJokesCommand> {
  constructor(private readonly jokesService: JokesService) {}

  async execute(command: StartJokesCommand): Promise<void> {
    this.jokesService.start(command.challenge, command.intervalSec, command.sources);
  }
}
