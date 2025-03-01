import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import logger from './logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // If the exception is an instance of HttpException, get the status code; otherwise, set it to 500 (Internal Server Error)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract message from exception if it's an HttpException; otherwise, use a generic message
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as { message: string | string[] }).message
        : 'An unexpected error occurred';

    // Log the error (customize this as needed for your logger)
    const logMessage = `${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    })} - METHOD: [${request.method}] - PATH: [${request.url}] - STATUS: [${status}] - MESSAGE: [${exception instanceof Error ? exception.message : 'Unknown error'}]`;

    logger.error(logMessage);

    // Send a response with a structured JSON error message
    response.status(status).json({
      status: 0,
      message:
        typeof message === 'string'
          ? message
          : message[0] || 'Internal server error',
    });
  }
}
