import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Error interno del servidor';

    const errorResponse = {
      statusCode: status,
      message,
      error: exception instanceof HttpException ? exception.name : 'Internal Server Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Si es error de validación, agregar detalles
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && 'message' in exceptionResponse) {
        errorResponse['errors'] = exceptionResponse['message'];
      }
    }

    response.status(status).json(errorResponse);
  }
}
