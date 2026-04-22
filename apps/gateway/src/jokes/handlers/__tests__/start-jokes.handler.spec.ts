import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StartJokesHandler } from '../start-jokes.handler';
import { StartJokesCommand } from '../../commands';

describe('StartJokesHandler', () => {
  let handler: StartJokesHandler;
  let client: { emit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    client = { emit: vi.fn() };
    handler = new StartJokesHandler(client as never);
  });

  it('emits start event to emitter with challenge, intervalSec and sources', async () => {
    const command = new StartJokesCommand('ch-1', 5, ['joke-api']);
    await handler.execute(command);

    expect(client.emit).toHaveBeenCalledOnce();
    expect(client.emit).toHaveBeenCalledWith('start', {
      challenge: 'ch-1',
      intervalSec: 5,
      sources: ['joke-api'],
    });
  });

  it('passes all sources from command', async () => {
    const command = new StartJokesCommand('ch-2', 10, ['joke-api', 'source-b']);
    await handler.execute(command);

    expect(client.emit).toHaveBeenCalledWith('start', {
      challenge: 'ch-2',
      intervalSec: 10,
      sources: ['joke-api', 'source-b'],
    });
  });
});
