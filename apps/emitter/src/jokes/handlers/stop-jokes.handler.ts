import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { StopJokesCommand } from '../commands';
import { JokesService } from '../jokes.service';

@CommandHandler(StopJokesCommand)
export class StopJokesHandler implements ICommandHandler<StopJokesCommand> {
  constructor(private readonly jokesService: JokesService) {}

  async execute(command: StopJokesCommand): Promise<void> {
    this.jokesService.stop(command.challenge);
  }
}
