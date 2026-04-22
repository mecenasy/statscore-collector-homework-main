import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

vi.mock('socket.io-client');
vi.mock('uuid', () => ({ v4: () => 'test-uuid' }));

import { io } from 'socket.io-client';

const mockSocket = {
  connected: false,
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};
vi.mocked(io).mockReturnValue(mockSocket as never);

describe('useJokeSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    vi.mocked(io).mockReturnValue(mockSocket as never);
  });

  async function getComposable() {
    const { useJokeSocket } = await import('../useJokeSocket');
    return useJokeSocket();
  }

  it('connects to the gateway on start', async () => {
    const { start } = await getComposable();
    start(5);
    expect(io).toHaveBeenCalledWith(
      'http://localhost:3000/jokes',
      expect.objectContaining({ query: { challenge: 'test-uuid' } }),
    );
  });

  it('emits start event with intervalSec', async () => {
    const { start } = await getComposable();
    start(10);
    expect(mockSocket.emit).toHaveBeenCalledWith('start', { intervalSec: 10 });
  });

  it('sets running to true after start', async () => {
    const { start, running } = await getComposable();
    start(5);
    expect(running.value).toBe(true);
  });

  it('emits stop event and sets running false on stop', async () => {
    const { start, stop, running } = await getComposable();
    start(5);
    stop();
    expect(mockSocket.emit).toHaveBeenCalledWith('stop');
    expect(running.value).toBe(false);
  });

  it('emits change-interval event', async () => {
    const { start, changeInterval } = await getComposable();
    start(5);
    changeInterval(10);
    expect(mockSocket.emit).toHaveBeenCalledWith('change-interval', { intervalSec: 10 });
  });

  it('does not reconnect if already connected', async () => {
    mockSocket.connected = true;
    const { start } = await getComposable();
    start(5);
    start(5);
    expect(io).toHaveBeenCalledTimes(1);
  });

  it('registers joke listener on connect', async () => {
    const { start } = await getComposable();
    start(5);
    expect(mockSocket.on).toHaveBeenCalledWith('joke', expect.any(Function));
  });

  it('registers connect_error listener on connect', async () => {
    const { start } = await getComposable();
    start(5);
    expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function));
  });

  it('adds joke to jokes array on joke event', async () => {
    const { start, jokes } = await getComposable();
    start(5);

    const jokeHandler = vi.mocked(mockSocket.on).mock.calls.find(
      ([event]) => event === 'joke',
    )?.[1] as ((data: unknown) => void) | undefined;

    jokeHandler?.({ id: 1, category: 'Test', setup: 'Q', delivery: 'A', flags: {} });
    expect(jokes.value).toHaveLength(1);
  });

  it('sets error on connect_error', async () => {
    const { start, error } = await getComposable();
    start(5);

    const errorHandler = vi.mocked(mockSocket.on).mock.calls.find(
      ([event]) => event === 'connect_error',
    )?.[1] as (() => void) | undefined;

    errorHandler?.();
    expect(error.value).toBeTruthy();
  });
});
