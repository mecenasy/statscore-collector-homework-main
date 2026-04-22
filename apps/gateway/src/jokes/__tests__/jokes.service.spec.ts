import { describe, it, expect } from 'vitest';
import { Subject } from 'rxjs';
import { JokesService } from '../jokes.service';

describe('JokesService (gateway bridge)', () => {
  it('exposes a joke$ Subject', () => {
    const service = new JokesService();
    expect(service.joke$).toBeInstanceOf(Subject);
  });

  it('forwards events pushed to joke$', () => {
    const service = new JokesService();
    const received: unknown[] = [];
    service.joke$.subscribe((e) => received.push(e));

    service.joke$.next({ challenge: 'ch-1', joke: { id: 1 } });

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ challenge: 'ch-1', joke: { id: 1 } });
  });

  it('multicasts to multiple subscribers', () => {
    const service = new JokesService();
    const a: unknown[] = [];
    const b: unknown[] = [];
    service.joke$.subscribe((e) => a.push(e));
    service.joke$.subscribe((e) => b.push(e));

    service.joke$.next({ challenge: 'ch-1', joke: {} });

    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
  });
});
