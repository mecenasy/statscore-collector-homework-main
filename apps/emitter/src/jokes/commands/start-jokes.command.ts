export class StartJokesCommand {
  constructor(
    public readonly challenge: string,
    public readonly intervalSec: number,
    public readonly sources: string[],
  ) {}
}
