export function getErrorMessage(
  error: unknown,
  fallback = "Ocurrió un error inesperado.",
): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
