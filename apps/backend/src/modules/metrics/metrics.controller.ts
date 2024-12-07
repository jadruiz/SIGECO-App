import { Controller, Get, Header } from '@nestjs/common';
import { register } from 'prom-client';
import { Public } from '../../core/decorators/public.decorator';

@Controller('metrics')
export class MetricsController {
  @Get()
  @Public()
  @Header('Content-Type', register.contentType)
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }
}
