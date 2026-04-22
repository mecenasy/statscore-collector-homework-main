import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartJokesHandler } from '../start-jokes.handler.js';
import { StartJokesCommand } from '../../commands/index.js';

describe('StartJokesHandler', () => {
  let handler: StartJokesHandler;
  let jokesService: { start: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    jokesService = { start: vi.fn() };
    handler = new StartJokesHandler(jokesService as never);
  });

  it('calls jokesService.start with challenge and intervalSec', async () => {
    const command = new StartJokesCommand('ch-1', 5);
    await handler.execute(command);

    expect(jokesService.start).toHaveBeenCalledOnce();
    expect(jokesService.start).toHaveBeenCalledWith('ch-1', 5);
  });

  it('passes the correct intervalSec from command', async () => {
    const command = new StartJokesCommand('ch-2', 10);
    await handler.execute(command);

    expect(jokesService.start).toHaveBeenCalledWith('ch-2', 10);
  });
});
