import { Injectable } from '@nestjs/common';
import type { JokeSourceInfo } from './joke-source-info.interface';

@Injectable()
export class SourceRegistryService {
  private readonly sources: JokeSourceInfo[] = [
    { id: 'joke-api', name: 'JokeAPI.dev' },
  ];

  getSources(): JokeSourceInfo[] {
    return this.sources;
  }

  register(source: JokeSourceInfo): void {
    this.sources.push(source);
  }
}
