export function getTenantFromSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const override = import.meta.env.VITE_TENANT_OVERRIDE;
  if (override) return override;

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  if (parts.length > 2 || (parts.length === 2 && parts[0] !== 'www')) {
    return parts[0];
  }

  return null;
}

export function getTenantHeader(): string | null {
  return import.meta.env.VITE_TENANT_OVERRIDE || getTenantFromSubdomain();
}
