import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, type ErrorDetail } from '../utils/AppError.js';

function validationDetails(error: ZodError): ErrorDetail[] {
  return error.issues.flatMap((issue) => {
    const [source, ...path] = issue.path;
    const field = path.length ? path.join('.') : String(source ?? 'body');
    if (issue.code === 'unrecognized_keys') {
      return issue.keys.map((key) => ({ field: path.length ? `${path.join('.')}.${key}` : key, message: 'Unknown field' }));
    }
    return [{ field, message: issue.message }];
  });
}

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, next) => {
  if (res.headersSent) { next(error); return; }
  let appError: AppError;
  if (error instanceof ZodError) {
    appError = new AppError(400, 'validation_error', 'Request validation failed', validationDetails(error));
  } else if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error && 'type' in error && 'status' in error
    && [400, 413, 415].includes(Number(error.status))) {
    const message = error.type === 'entity.too.large' ? 'JSON body exceeds 100kb' : 'Invalid JSON request body';
    appError = new AppError(400, 'validation_error', 'Request validation failed', [{ field: 'body', message }]);
  } else {
    appError = new AppError(500, 'internal_error', 'An unexpected error occurred');
  }
  if (appError.status === 500) req.log.error({ err: error }, 'Request failed');
  res.status(appError.status).json({
    error: {
      code: appError.code,
      message: appError.status === 500 ? 'An unexpected error occurred' : appError.message,
      ...(appError.code === 'validation_error' ? { details: appError.details ?? [] } : {}),
    },
  });
};
