import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  BehaviorSubject,
  Subject,
  Subscription,
  switchMap,
  timer,
  map,
  catchError,
  EMPTY,
  take,
} from 'rxjs';

const JOKE_API_URL = 'https://v2.jokeapi.dev/joke/Any?type=twopart';

export interface JokeEvent {
  challenge: string;
  joke: unknown;
}

@Injectable()
export class JokesService {
  private readonly logger = new Logger(JokesService.name);

  private readonly sessions = new Map<string, Subscription>();
  private readonly intervals = new Map<string, BehaviorSubject<number>>();

  readonly joke$ = new Subject<JokeEvent>();

  constructor(private readonly httpService: HttpService) {}

  start(challenge: string, intervalSec: number) {
    this.stop(challenge);

    const interval$ = new BehaviorSubject(intervalSec);
    this.intervals.set(challenge, interval$);

    const sub = interval$
      .pipe(
        switchMap((sec) => timer(0, sec * 1000)),
        switchMap(() =>
          this.httpService.get<unknown>(JOKE_API_URL).pipe(
            map((res) => res.data),
            catchError((err) => {
              this.logger.error(`Fetch failed: ${err.message}`);
              return EMPTY;
            }),
            take(1),
          ),
        ),
      )
      .subscribe((joke) => {
        this.joke$.next({ challenge, joke });
      });

    this.sessions.set(challenge, sub);
    this.logger.log(`Started jokes for ${challenge} every ${intervalSec}s`);
  }

  changeInterval(challenge: string, intervalSec: number) {
    const interval$ = this.intervals.get(challenge);
    if (interval$) {
      interval$.next(intervalSec);
      this.logger.log(`Changed interval for ${challenge} to ${intervalSec}s`);
    }
  }

  stop(challenge: string) {
    this.sessions.get(challenge)?.unsubscribe();
    this.sessions.delete(challenge);
    this.intervals.get(challenge)?.complete();
    this.intervals.delete(challenge);
    this.logger.log(`Stopped jokes for ${challenge}`);
  }
}
