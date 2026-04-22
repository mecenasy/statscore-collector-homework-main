import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangeIntervalHandler } from '../change-interval.handler';
import { ChangeIntervalCommand } from '../../commands';

describe('ChangeIntervalHandler', () => {
  let handler: ChangeIntervalHandler;
  let client: { emit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    client = { emit: vi.fn() };
    handler = new ChangeIntervalHandler(client as never);
  });

  it('emits change-interval event to emitter with challenge and intervalSec', async () => {
    const command = new ChangeIntervalCommand('ch-1', 10);
    await handler.execute(command);

    expect(client.emit).toHaveBeenCalledOnce();
    expect(client.emit).toHaveBeenCalledWith('change-interval', {
      challenge: 'ch-1',
      intervalSec: 10,
    });
  });

  it('passes the correct intervalSec from command', async () => {
    const command = new ChangeIntervalCommand('ch-2', 15);
    await handler.execute(command);

    expect(client.emit).toHaveBeenCalledWith('change-interval', {
      challenge: 'ch-2',
      intervalSec: 15,
    });
  });
});
