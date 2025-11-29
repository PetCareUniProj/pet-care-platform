export function resolvePortalContainer(): HTMLElement | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const adminContainer = document.querySelector(".admin-theme") as HTMLElement | null;
  return adminContainer ?? document.body ?? undefined;
}
