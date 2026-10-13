export interface ErrorDetail {
  field: string;
  message: string;
}
export type ErrorCode = 'validation_error' | 'not_found' | 'internal_error';

export class AppError extends Error {
  constructor(
    public readonly status: 400 | 404 | 500,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = 'AppError';
  }
}
