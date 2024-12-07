// src/guards/custom-throttler.guard.ts
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(CustomThrottlerGuard.name);

  protected async getTracker(context: ExecutionContext): Promise<string> {
    // Verifica si el contexto es HTTP antes de intentar rastrear la IP
    if (context.switchToHttp && typeof context.switchToHttp === 'function') {
      const request = context.switchToHttp().getRequest();
      const ip = request.ip; // Usa la IP del cliente para la limitación
      this.logger.log(`Tracking IP: ${ip}`);
      return Promise.resolve(ip);
    }

    // Si no es un contexto HTTP, no se aplica rate limiting
    this.logger.warn('Non-HTTP context detected, skipping IP tracking.');
    return Promise.resolve('non-http-context');
  }
}
