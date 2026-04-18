'use client';

export type PdfPerfPhase = 'preview' | 'download' | 'non-genuine-download';

export type PdfPerfMetric = {
  phase: PdfPerfPhase;
  destination: string;
  fingerprint: string;
  assetLoadMs: number;
  buildMs: number;
  blobUrlMs: number;
  downloadTriggerMs: number;
  totalMs: number;
  reusedPreview: boolean;
  timestamp: string;
};

export type PdfPerfBudget = {
  assetLoadMs: number;
  buildMs: number;
  blobUrlMs: number;
  totalMs: number;
};

export const PDF_PERF_BUDGET: PdfPerfBudget = {
  assetLoadMs: 12_000,
  buildMs: 40_000,
  blobUrlMs: 8_000,
  totalMs: 50_000,
};

type PdfPerfStore = {
  history: PdfPerfMetric[];
  lastByPhase: Partial<Record<PdfPerfPhase, PdfPerfMetric>>;
};

const PERF_STORE_KEY = '__studyNaviPdfPerf';
const MAX_HISTORY = 30;

export function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function elapsedMs(start: number): number {
  return Math.max(0, nowMs() - start);
}

export function isPdfPerfWithinBudget(
  metric: Pick<PdfPerfMetric, 'assetLoadMs' | 'buildMs' | 'blobUrlMs' | 'totalMs'>,
  budget: PdfPerfBudget = PDF_PERF_BUDGET,
): boolean {
  return (
    metric.assetLoadMs <= budget.assetLoadMs
    && metric.buildMs <= budget.buildMs
    && metric.blobUrlMs <= budget.blobUrlMs
    && metric.totalMs <= budget.totalMs
  );
}

export function pushPdfPerfMetric(metric: PdfPerfMetric) {
  const globalStore = (globalThis as any)[PERF_STORE_KEY] as PdfPerfStore | undefined;
  const store: PdfPerfStore = globalStore ?? { history: [], lastByPhase: {} };

  const history = [...store.history, metric].slice(-MAX_HISTORY);
  const nextStore: PdfPerfStore = {
    history,
    lastByPhase: { ...store.lastByPhase, [metric.phase]: metric },
  };

  (globalThis as any)[PERF_STORE_KEY] = nextStore;
}

export function readPdfPerfStore(): PdfPerfStore | undefined {
  return (globalThis as any)[PERF_STORE_KEY] as PdfPerfStore | undefined;
}

