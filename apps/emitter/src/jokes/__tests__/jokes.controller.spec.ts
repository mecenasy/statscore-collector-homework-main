import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JokesController } from '../jokes.controller';
import { StartJokesCommand, StopJokesCommand, ChangeIntervalCommand } from '../commands';

describe('JokesController (emitter)', () => {
  let controller: JokesController;
  let commandBus: { execute: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    commandBus = { execute: vi.fn() };
    controller = new JokesController(commandBus as never);
  });

  it('dispatches StartJokesCommand with correct params', () => {
    controller.handleStart({ challenge: 'ch-1', intervalSec: 5, sources: ['joke-api'] });

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(StartJokesCommand));
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ challenge: 'ch-1', intervalSec: 5, sources: ['joke-api'] }),
    );
  });

  it('defaults intervalSec to 5 when missing', () => {
    controller.handleStart({ challenge: 'ch-1', intervalSec: undefined as never, sources: [] });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ intervalSec: 5 }),
    );
  });

  it('defaults sources to ["joke-api"] when missing', () => {
    controller.handleStart({ challenge: 'ch-1', intervalSec: 5, sources: undefined as never });

    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ sources: ['joke-api'] }),
    );
  });

  it('dispatches StopJokesCommand with correct challenge', () => {
    controller.handleStop({ challenge: 'ch-1' });

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(StopJokesCommand));
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ challenge: 'ch-1' }),
    );
  });

  it('dispatches ChangeIntervalCommand with correct params', () => {
    controller.handleChangeInterval({ challenge: 'ch-1', intervalSec: 10 });

    expect(commandBus.execute).toHaveBeenCalledWith(expect.any(ChangeIntervalCommand));
    expect(commandBus.execute).toHaveBeenCalledWith(
      expect.objectContaining({ challenge: 'ch-1', intervalSec: 10 }),
    );
  });
});
