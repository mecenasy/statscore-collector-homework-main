import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JokesService, type JokeEvent } from './jokes.service';

@Controller()
export class JokesEventsController {
  constructor(private readonly jokesService: JokesService) {}

  @EventPattern('joke')
  handleJoke(@Payload() event: JokeEvent) {
    this.jokesService.joke$.next(event);
  }
}
