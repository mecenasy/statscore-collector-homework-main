import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartJokesHandler } from '../start-jokes.handler';
import { StartJokesCommand } from '../../commands';

describe('StartJokesHandler (emitter)', () => {
  let handler: StartJokesHandler;
  let jokesService: { start: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    jokesService = { start: vi.fn() };
    handler = new StartJokesHandler(jokesService as never);
  });

  it('calls jokesService.start with challenge, intervalSec and sources', async () => {
    const command = new StartJokesCommand('ch-1', 5, ['joke-api']);
    await handler.execute(command);

    expect(jokesService.start).toHaveBeenCalledOnce();
    expect(jokesService.start).toHaveBeenCalledWith('ch-1', 5, ['joke-api']);
  });

  it('passes multiple sources from command', async () => {
    const command = new StartJokesCommand('ch-2', 10, ['joke-api', 'source-b']);
    await handler.execute(command);

    expect(jokesService.start).toHaveBeenCalledWith('ch-2', 10, ['joke-api', 'source-b']);
  });
});
