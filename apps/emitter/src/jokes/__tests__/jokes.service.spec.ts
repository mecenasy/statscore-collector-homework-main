import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { JokesService } from '../jokes.service';
import type { JokeSource } from '../sources';

const mockJoke = { id: 1, source: 'joke-api', category: 'Test', setup: 'Q?', delivery: 'A!', flags: {} };

function makeSource(id = 'joke-api', response = of(mockJoke)): JokeSource & { fetch: ReturnType<typeof vi.fn> } {
  return { id, name: 'Test', fetch: vi.fn(() => response) };
}

function makeClient() {
  return { emit: vi.fn() };
}

describe('JokesService (emitter)', () => {
  let service: JokesService;
  let source: ReturnType<typeof makeSource>;
  let client: ReturnType<typeof makeClient>;

  beforeEach(() => {
    vi.useFakeTimers();
    source = makeSource();
    client = makeClient();
    service = new JokesService([source] as never, client as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fetches from the selected source immediately after start', async () => {
    service.start('ch-1', 5, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);

    expect(source.fetch).toHaveBeenCalledOnce();
  });

  it('emits joke via gatewayClient with challenge and joke', async () => {
    service.start('ch-1', 5, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);

    expect(client.emit).toHaveBeenCalledWith('joke', { challenge: 'ch-1', joke: mockJoke });
  });

  it('emits again after interval elapses', async () => {
    service.start('ch-1', 5, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);
    await vi.advanceTimersByTimeAsync(5000);

    expect(source.fetch.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('stops emitting after stop()', async () => {
    service.start('ch-1', 5, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);
    service.stop('ch-1');
    const countAfterStop = client.emit.mock.calls.length;

    await vi.advanceTimersByTimeAsync(10000);
    expect(client.emit.mock.calls.length).toBe(countAfterStop);
  });

  it('cleans up maps after stop()', () => {
    service.start('ch-1', 5, ['joke-api']);
    service.stop('ch-1');

    expect(service['sessions'].has('ch-1')).toBe(false);
    expect(service['intervals'].has('ch-1')).toBe(false);
  });

  it('stop() on unknown challenge does not throw', () => {
    expect(() => service.stop('unknown')).not.toThrow();
  });

  it('restarts session on second start()', async () => {
    service.start('ch-1', 5, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);
    service.start('ch-1', 10, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);

    expect(service['sessions'].size).toBe(1);
    expect(client.emit.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('changeInterval updates the interval subject', () => {
    service.start('ch-1', 5, ['joke-api']);
    service.changeInterval('ch-1', 10);

    expect(service['intervals'].get('ch-1')?.value).toBe(10);
  });

  it('changeInterval on unknown challenge does not throw', () => {
    expect(() => service.changeInterval('unknown', 10)).not.toThrow();
  });

  it('swallows fetch errors and keeps session alive', async () => {
    const errorSource = makeSource('joke-api', throwError(() => new Error('network')));
    service = new JokesService([errorSource] as never, client as never);

    service.start('ch-1', 5, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);

    expect(client.emit).not.toHaveBeenCalled();
    expect(() => vi.advanceTimersByTimeAsync(5000)).not.toThrow();
  });

  it('skips unknown source ids without throwing', async () => {
    service.start('ch-1', 5, ['no-such-source']);
    await vi.advanceTimersByTimeAsync(1);

    expect(source.fetch).not.toHaveBeenCalled();
    expect(client.emit).not.toHaveBeenCalled();
  });

  it('uses all registered sources when empty array is passed', async () => {
    service.start('ch-1', 5, []);
    await vi.advanceTimersByTimeAsync(1);

    expect(source.fetch).toHaveBeenCalled();
  });

  it('emits one joke per source per tick when multiple sources are selected', async () => {
    const sourceB = makeSource('source-b');
    service = new JokesService([source, sourceB] as never, client as never);

    service.start('ch-1', 5, ['joke-api', 'source-b']);
    await vi.advanceTimersByTimeAsync(1);

    expect(source.fetch).toHaveBeenCalled();
    expect(sourceB.fetch).toHaveBeenCalled();
    expect(client.emit.mock.calls.length).toBe(2);
  });

  it('supports multiple independent sessions', async () => {
    service.start('ch-1', 5, ['joke-api']);
    service.start('ch-2', 5, ['joke-api']);
    await vi.advanceTimersByTimeAsync(1);

    const challenges = client.emit.mock.calls.map((c) => (c[1] as { challenge: string }).challenge);
    expect(challenges).toContain('ch-1');
    expect(challenges).toContain('ch-2');
  });
});
