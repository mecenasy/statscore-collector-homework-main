export class ChangeIntervalCommand {
  constructor(
    public readonly challenge: string,
    public readonly intervalSec: number,
  ) {}
}
