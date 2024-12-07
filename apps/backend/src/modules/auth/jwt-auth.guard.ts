import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../core/decorators/public.decorator';
import { SharedService } from '../../core/shared/shared.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly sharedService: SharedService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (this.isOptionsRequest(request) || this.isPublicRoute(context)) {
      return true;
    }

    const token = this.extractToken(request);
    if (!token || (await this.sharedService.isTokenBlacklisted(token))) {
      throw new UnauthorizedException(
        'Invalid or missing authentication token',
      );
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  private isOptionsRequest(request: any): boolean {
    return request.method === 'OPTIONS';
  }

  private isPublicRoute(context: ExecutionContext): boolean {
    return this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error(
        'Authorization header is missing or malformed:',
        authHeader,
      );
      return null;
    }
    const [, token] = authHeader.split(' ');
    return token;
  }

  handleRequest(
    err: Error | null,
    user: any,
    info: any,
    context: ExecutionContext
  ) {
    if (err || !user) {
      console.error('Authentication failed:', err, user, info); // Agregar información adicional
      throw new UnauthorizedException(
        'Invalid or missing authentication token',
      );
    }
    context.switchToHttp().getRequest().user = user;
    return user;
  }
}
