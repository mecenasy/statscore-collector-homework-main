import { Controller, Get } from '@nestjs/common';
import { SourceRegistryService } from './sources';

@Controller('jokes')
export class JokesHttpController {
  constructor(private readonly sourceRegistry: SourceRegistryService) {}

  @Get('sources')
  getSources() {
    return this.sourceRegistry.getSources();
  }
}
