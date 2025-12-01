export const DEFAULT_PAGE_SIZE = 20;
export const MIN_PAGE_SIZE = 1;
export const MAX_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = Array.from({ length: MAX_PAGE_SIZE }, (_, index) => index + 1);

export function normalizePageSize(value: number | undefined): number {
  if (!Number.isFinite(value ?? Number.NaN)) {
    return DEFAULT_PAGE_SIZE;
  }

  const nextValue = value ?? DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(nextValue, MIN_PAGE_SIZE), MAX_PAGE_SIZE);
}
