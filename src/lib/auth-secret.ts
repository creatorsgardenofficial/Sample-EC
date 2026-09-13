export function resolveAuthSecret(): string | undefined {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const trimmed = secret?.trim();
  return trimmed || undefined;
}
