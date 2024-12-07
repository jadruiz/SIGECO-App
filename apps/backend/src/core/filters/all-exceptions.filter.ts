// src/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { CustomLoggerService } from '../../logging/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? 'An unexpected error occurred'
        : exceptionResponse;

    const errorResponse = {
      message: Array.isArray(message) ? message.join(', ') : message,
      error: exception instanceof HttpException ? exception.name : 'Error',
      path: request.url,
    };

    const trace = exception instanceof Error ? exception.stack : '';
    this.logger.error(JSON.stringify(errorResponse), trace ?? 'No trace available');

    response.status(status).json(errorResponse);
  }
}
