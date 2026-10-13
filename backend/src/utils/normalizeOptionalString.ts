export function normalizeOptionalString(
  value: string | null | undefined,
): string | null {
  return value?.trim() || null;
}
