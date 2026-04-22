import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ChangeIntervalHandler } from '../change-interval.handler';
import { ChangeIntervalCommand } from '../../commands';

describe('ChangeIntervalHandler (emitter)', () => {
  let handler: ChangeIntervalHandler;
  let jokesService: { changeInterval: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    jokesService = { changeInterval: vi.fn() };
    handler = new ChangeIntervalHandler(jokesService as never);
  });

  it('calls jokesService.changeInterval with challenge and intervalSec', async () => {
    const command = new ChangeIntervalCommand('ch-1', 10);
    await handler.execute(command);

    expect(jokesService.changeInterval).toHaveBeenCalledOnce();
    expect(jokesService.changeInterval).toHaveBeenCalledWith('ch-1', 10);
  });

  it('passes the correct intervalSec from command', async () => {
    const command = new ChangeIntervalCommand('ch-2', 15);
    await handler.execute(command);

    expect(jokesService.changeInterval).toHaveBeenCalledWith('ch-2', 15);
  });
});
