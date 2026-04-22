import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';

export interface JokeEvent {
  challenge: string;
  joke: unknown;
}

@Injectable()
export class JokesService {
  readonly joke$ = new Subject<JokeEvent>();
}
