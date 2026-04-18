const normalizeBoolean = (value: string | undefined) => String(value || '').trim().toLowerCase() === 'true';

export const isProductionRuntime = () => process.env.NODE_ENV === 'production';

export const isE2EAuthBypassEnabled = () =>
  !isProductionRuntime() && normalizeBoolean(process.env.NEXT_PUBLIC_E2E_AUTH_BYPASS);

export const isE2EMockDataEnabled = () =>
  !isProductionRuntime() && normalizeBoolean(process.env.NEXT_PUBLIC_E2E_MOCK_DATA);

