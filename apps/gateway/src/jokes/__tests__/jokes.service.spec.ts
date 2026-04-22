import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { JokesService } from '../jokes.service.js';

const mockJoke = { id: 1, category: 'Test', setup: 'Q?', delivery: 'A!', flags: {} };

function makeHttpService(response = of({ data: mockJoke })) {
  return { get: vi.fn(() => response) };
}

describe('JokesService', () => {
  let service: JokesService;
  let http: ReturnType<typeof makeHttpService>;

  beforeEach(() => {
    vi.useFakeTimers();
    http = makeHttpService();
    service = new JokesService(http as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('emits a joke immediately after start', async () => {
    const emitted: unknown[] = [];
    service.joke$.subscribe((e) => emitted.push(e));

    service.start('ch-1', 5);
    await vi.advanceTimersByTimeAsync(1);

    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toEqual({ challenge: 'ch-1', joke: mockJoke });
  });

  it('calls the joke API with correct URL', async () => {
    service.start('ch-1', 5);
    await vi.advanceTimersByTimeAsync(1);

    expect(http.get).toHaveBeenCalledWith(
      'https://v2.jokeapi.dev/joke/Any?type=twopart',
    );
  });

  it('emits again after interval elapses', async () => {
    const emitted: unknown[] = [];
    service.joke$.subscribe((e) => emitted.push(e));

    service.start('ch-1', 5);
    await vi.advanceTimersByTimeAsync(1);
    await vi.advanceTimersByTimeAsync(5000);

    expect(emitted.length).toBeGreaterThanOrEqual(2);
  });

  it('stops emitting after stop()', async () => {
    const emitted: unknown[] = [];
    service.joke$.subscribe((e) => emitted.push(e));

    service.start('ch-1', 5);
    await vi.advanceTimersByTimeAsync(1);
    service.stop('ch-1');
    const countAfterStop = emitted.length;

    await vi.advanceTimersByTimeAsync(10000);
    expect(emitted.length).toBe(countAfterStop);
  });

  it('cleans up maps after stop()', () => {
    service.start('ch-1', 5);
    service.stop('ch-1');

    expect(service['sessions'].has('ch-1')).toBe(false);
    expect(service['intervals'].has('ch-1')).toBe(false);
  });

  it('stop() on unknown challenge does not throw', () => {
    expect(() => service.stop('unknown')).not.toThrow();
  });

  it('restarts session on second start()', async () => {
    const emitted: unknown[] = [];
    service.joke$.subscribe((e) => emitted.push(e));

    service.start('ch-1', 5);
    await vi.advanceTimersByTimeAsync(1);
    service.start('ch-1', 10);
    await vi.advanceTimersByTimeAsync(1);

    expect(service['sessions'].size).toBe(1);
    expect(emitted.length).toBeGreaterThanOrEqual(2);
  });

  it('changeInterval updates the interval subject', async () => {
    service.start('ch-1', 5);
    service.changeInterval('ch-1', 10);

    expect(service['intervals'].get('ch-1')?.value).toBe(10);
  });

  it('changeInterval on unknown challenge does not throw', () => {
    expect(() => service.changeInterval('unknown', 10)).not.toThrow();
  });

  it('swallows HTTP errors and keeps session alive', async () => {
    const errorHttp = { get: vi.fn(() => throwError(() => new Error('network'))) };
    service = new JokesService(errorHttp as never);

    const emitted: unknown[] = [];
    service.joke$.subscribe((e) => emitted.push(e));

    service.start('ch-1', 5);
    await vi.advanceTimersByTimeAsync(1);

    expect(emitted).toHaveLength(0);
    expect(() => vi.advanceTimersByTimeAsync(5000)).not.toThrow();
  });

  it('supports multiple independent sessions', async () => {
    const emitted: string[] = [];
    service.joke$.subscribe((e) => emitted.push((e as { challenge: string }).challenge));

    service.start('ch-1', 5);
    service.start('ch-2', 5);
    await vi.advanceTimersByTimeAsync(1);

    expect(emitted).toContain('ch-1');
    expect(emitted).toContain('ch-2');
  });
});
