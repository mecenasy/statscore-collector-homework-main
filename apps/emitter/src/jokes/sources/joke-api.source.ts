import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { JokeSource } from './joke-source.interface';
import type { NormalizedJoke } from './normalized-joke.interface';

const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any?type=twopart';

interface JokeApiResponse {
  id: number;
  category: string;
  setup: string;
  delivery: string;
  flags: Record<string, boolean>;
}

@Injectable()
export class JokeApiSource implements JokeSource {
  readonly id = 'joke-api';
  readonly name = 'JokeAPI.dev';

  constructor(private readonly httpService: HttpService) {}

  fetch(): Observable<NormalizedJoke> {
    return this.httpService
      .get<JokeApiResponse>(JOKE_API_URL)
      .pipe(map((res) => this.transform(res.data)));
  }

  private transform(raw: JokeApiResponse): NormalizedJoke {
    return {
      id: raw.id,
      source: this.id,
      category: raw.category,
      setup: raw.setup,
      delivery: raw.delivery,
      flags: raw.flags,
    };
  }
}
