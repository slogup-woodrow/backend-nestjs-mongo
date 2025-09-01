import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
  HttpStatus,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { commonConstants } from '../constants/common.constants';
import { get } from 'lodash';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: WinstonLogger,
  ) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const error =
      exception instanceof HttpException ? exception.getResponse() : exception;

    const languages = commonConstants.props.languages;
    const acceptLanguage = get(req, 'headers.accept-language');
    const messageLanguage =
      typeof acceptLanguage === 'string' &&
      Object.values(languages).includes(acceptLanguage as any)
        ? acceptLanguage
        : languages.KO;

    const errorCode = get(error, 'errorCode') || undefined;
    let message;
    if (typeof error === 'object' && error !== null) {
      if (error[messageLanguage]) {
        message = error[messageLanguage];
      } else if (error['message']) {
        message = error['message'];
      } else {
        message = error;
      }
    } else {
      message = error;
    }
    const data = error['data'] || undefined;
    const stack = exception['stack'] || undefined;
    const resData =
      statusCode >= 500
        ? {
            statusCode,
            message,
            stack,
          }
        : {
            statusCode,
            errorCode,
            message,
            data,
            error:
              exception instanceof HttpException ? exception.name : undefined,
          };

    return res.status(statusCode).json(resData);
  }
}
