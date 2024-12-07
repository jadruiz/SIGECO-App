// src/core/middleware/cookie.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class CookieMiddleware implements NestMiddleware {
  constructor(private reflector: Reflector) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Omitir el middleware para solicitudes de Prometheus u otras herramientas automatizadas
    if (
      req.headers['user-agent'] &&
      req.headers['user-agent'].includes('Prometheus')
    ) {
      return next();
    }

    // Verificar si `req.route` está definido
    if (!req.route) {
      return next();
    }

    // Determinar si la ruta es pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      req.route.path,
      req.route.stack && req.route.stack[0] ? req.route.stack[0].handle : null,
    ]);

    if (isPublic) {
      return next();
    }

    // Aplicar CSRF token en cookies si la ruta no es pública
    res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true });
    next();
  }
}
