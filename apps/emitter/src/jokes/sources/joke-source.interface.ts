import type { Observable } from 'rxjs';
import type { NormalizedJoke } from './normalized-joke.interface';

export interface JokeSource {
  readonly id: string;
  readonly name: string;
  fetch(): Observable<NormalizedJoke>;
}
