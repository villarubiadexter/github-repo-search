export function getGithubApiErrorMessage(err: unknown, fallback: string): string {
  const error = err as { status?: number; error?: { message?: string } };
  if (error?.status === 403) {
    return 'GitHub rate limit reached. Try again later.';
  }
  if (error?.error?.message) {
    return error.error.message;
  }
  return fallback;
}
