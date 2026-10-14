import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';
import { ApiError } from '../api/client';
export function mapFormError<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: ReadonlyArray<FieldPath<T>>,
  aliases: Readonly<Record<string, FieldPath<T>>> = {},
): void {
  let mapped = false;
  if (error instanceof ApiError)
    for (const detail of error.details) {
      const field = fields.find(
        (item) => item === (aliases[detail.field] ?? detail.field),
      );
      if (field) {
        setError(field, { message: detail.message });
        mapped = true;
      }
    }
  if (!mapped)
    setError('root', {
      message:
        error instanceof Error
          ? error.message
          : 'Unable to save. Please try again.',
    });
}
