'use client';

import { getAuthBearerToken } from '@/lib/firebase/client-request-auth';

type RuntimeAlertInput = {
  source: string;
  message: string;
  context?: Record<string, unknown>;
};

const RUNTIME_ALERT_ENDPOINT = '/api/runtime-alert';

function buildPayload(input: RuntimeAlertInput) {
  return {
    source: input.source.slice(0, 300),
    message: input.message.slice(0, 300),
    context: input.context,
  };
}

export function reportRuntimeAlert(input: RuntimeAlertInput) {
  const payload = buildPayload(input);
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[runtime-alert][client]', payload);
  }

  void (async () => {
    try {
      const token = await getAuthBearerToken();
      if (!token) return;
      await fetch(RUNTIME_ALERT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch {
      // Monitoring should never block UI flow.
    }
  })();
}
