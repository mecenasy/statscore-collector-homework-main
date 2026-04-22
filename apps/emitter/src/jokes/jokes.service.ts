import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  BehaviorSubject,
  Subscription,
  switchMap,
  exhaustMap,
  timer,
  catchError,
  EMPTY,
  take,
  merge,
} from 'rxjs';
import type { JokeSource } from './sources';

@Injectable()
export class JokesService {
  private readonly logger = new Logger(JokesService.name);
  private readonly sessions = new Map<string, Subscription>();
  private readonly intervals = new Map<string, BehaviorSubject<number>>();

  constructor(
    @Inject('JOKE_SOURCES') private readonly sources: JokeSource[],
    @Inject('GATEWAY_CLIENT') private readonly gatewayClient: ClientProxy,
  ) {}

  start(challenge: string, intervalSec: number, sourceIds: string[]) {
    this.stop(challenge);

    const activeSources = sourceIds.length
      ? this.sources.filter((s) => sourceIds.includes(s.id))
      : this.sources;

    if (!activeSources.length) {
      this.logger.warn(`No sources matched for ids: [${sourceIds.join(', ')}]`);
      return;
    }

    const interval$ = new BehaviorSubject(intervalSec);
    this.intervals.set(challenge, interval$);

    const sub = interval$
      .pipe(
        switchMap((sec) =>
          timer(0, sec * 1000).pipe(
            exhaustMap(() =>
              merge(
                ...activeSources.map((s) =>
                  s.fetch().pipe(
                    catchError((err) => {
                      this.logger.error(`Fetch failed [${s.id}]: ${err.message}`);
                      return EMPTY;
                    }),
                    take(1),
                  ),
                ),
              ),
            ),
          ),
        ),
      )
      .subscribe((joke) => {
        this.gatewayClient.emit('joke', { challenge, joke });
      });

    this.sessions.set(challenge, sub);
    this.logger.log(
      `Started for ${challenge} every ${intervalSec}s via [${activeSources.map((s) => s.id).join(', ')}]`,
    );
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
