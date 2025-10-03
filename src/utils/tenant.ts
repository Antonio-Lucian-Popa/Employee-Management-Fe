// utils/tenant.ts
export const TENANT_LS_KEY = "tenant";

export function getTenantFromLocalStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(TENANT_LS_KEY);
    return v && v.trim() ? v.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

export function setTenantToLocalStorage(slug: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (slug && slug.trim()) {
      window.localStorage.setItem(TENANT_LS_KEY, slug.trim().toLowerCase());
    } else {
      window.localStorage.removeItem(TENANT_LS_KEY);
    }
  } catch { /* empty */ }
}

export function getTenantFromSubdomain(): string | null {
  if (typeof window === "undefined") return null;
  const hostname = window.location.hostname;          // ex: weeding-organizer.app.tld
  const parts = hostname.split(".");
  // subdomeniu clasic: <tenant>.<domain>.<tld>
  if (parts.length >= 3) return parts[0].toLowerCase();
  // www.<tenant>.<tld> – dacă vrei să permiți www.tenant.tld, adaptează aici
  return null;
}

/** sursa canonică: localStorage -> override (DEV) -> subdomeniu */
export function resolveTenant(): string | null {
  const ls = getTenantFromLocalStorage();
  if (ls) return ls;

  const override = (import.meta.env.VITE_TENANT_OVERRIDE as string | undefined)?.trim();
  if (override) return override.toLowerCase();

  return getTenantFromSubdomain();
}

/** folosită de axios interceptor */
export function getTenantHeader(): string | null {
  return resolveTenant();
}
