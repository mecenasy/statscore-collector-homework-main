import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Subject } from 'rxjs';
import { JokesGateway } from '../jokes.gateway.js';
import { StartJokesCommand, StopJokesCommand, ChangeIntervalCommand } from '../commands/index.js';
import type { JokeEvent } from '../jokes.service.js';

function makeClient(challenge: string) {
  return {
    handshake: { query: { challenge } },
    join: vi.fn(),
    disconnect: vi.fn(),
  };
}

describe('JokesGateway', () => {
  let gateway: JokesGateway;
  let commandBus: { execute: ReturnType<typeof vi.fn> };
  let joke$: Subject<JokeEvent>;
  let mockEmit: ReturnType<typeof vi.fn>;
  let mockTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    commandBus = { execute: vi.fn() };
    joke$ = new Subject<JokeEvent>();
    gateway = new JokesGateway(commandBus as never, { joke$ } as never);

    mockEmit = vi.fn();
    mockTo = vi.fn(() => ({ emit: mockEmit }));
    gateway.server = { to: mockTo } as never;
  });

  describe('onModuleInit / onModuleDestroy', () => {
    it('subscribes to joke$ and forwards to WebSocket room', () => {
      gateway.onModuleInit();
      joke$.next({ challenge: 'ch-1', joke: { id: 1 } });

      expect(mockTo).toHaveBeenCalledWith('ch-1');
      expect(mockEmit).toHaveBeenCalledWith('joke', { id: 1 });
    });

    it('unsubscribes on destroy', () => {
      gateway.onModuleInit();
      gateway.onModuleDestroy();

      joke$.next({ challenge: 'ch-1', joke: {} });
      expect(mockTo).not.toHaveBeenCalled();
    });
  });

  describe('handleConnection', () => {
    it('joins room with challenge', async () => {
      const client = makeClient('ch-1');
      await gateway.handleConnection(client as never);

      expect(client.join).toHaveBeenCalledWith('ch-1');
    });

    it('disconnects client without challenge', async () => {
      const client = makeClient('');
      await gateway.handleConnection(client as never);

      expect(client.disconnect).toHaveBeenCalled();
      expect(client.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('dispatches StopJokesCommand', () => {
      gateway.handleDisconnect(makeClient('ch-1') as never);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(StopJokesCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ challenge: 'ch-1' }),
      );
    });

    it('does not dispatch when no challenge', () => {
      gateway.handleDisconnect(makeClient('') as never);

      expect(commandBus.execute).not.toHaveBeenCalled();
    });
  });

  describe('handleStart', () => {
    it('dispatches StartJokesCommand with correct params', () => {
      gateway.handleStart(makeClient('ch-1') as never, { intervalSec: 10 });

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(StartJokesCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ challenge: 'ch-1', intervalSec: 10 }),
      );
    });

    it('defaults intervalSec to 5 when missing', () => {
      gateway.handleStart(makeClient('ch-1') as never, { intervalSec: undefined as never });

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ intervalSec: 5 }),
      );
    });
  });

  describe('handleStop', () => {
    it('dispatches StopJokesCommand', () => {
      gateway.handleStop(makeClient('ch-1') as never);

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(StopJokesCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ challenge: 'ch-1' }),
      );
    });
  });

  describe('handleChangeInterval', () => {
    it('dispatches ChangeIntervalCommand with correct params', () => {
      gateway.handleChangeInterval(makeClient('ch-1') as never, { intervalSec: 15 });

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(ChangeIntervalCommand),
      );
      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.objectContaining({ challenge: 'ch-1', intervalSec: 15 }),
      );
    });
  });
});
