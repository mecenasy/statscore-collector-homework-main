import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StopJokesHandler } from '../stop-jokes.handler.js';
import { StopJokesCommand } from '../../commands/index.js';

describe('StopJokesHandler', () => {
  let handler: StopJokesHandler;
  let jokesService: { stop: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    jokesService = { stop: vi.fn() };
    handler = new StopJokesHandler(jokesService as never);
  });

  it('calls jokesService.stop with the challenge', async () => {
    const command = new StopJokesCommand('ch-1');
    await handler.execute(command);

    expect(jokesService.stop).toHaveBeenCalledOnce();
    expect(jokesService.stop).toHaveBeenCalledWith('ch-1');
  });

  it('passes the correct challenge from command', async () => {
    const command = new StopJokesCommand('ch-99');
    await handler.execute(command);

    expect(jokesService.stop).toHaveBeenCalledWith('ch-99');
  });
});
