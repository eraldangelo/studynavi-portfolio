'use client';

import type { ChatMessage } from './ai-chatbot-types';
import { buildAuthorizedJsonHeaders } from '@/lib/firebase/client-request-auth';

type Position = { x: number; y: number };

type PanelStyleParams = {
  bubbleHeight: number;
  panelHeight: number;
  panelWidth: number;
  openToRight: boolean;
  position: Position;
  defaultBubbleSize: number;
  margin: number;
};

export function computePanelStyle(params: PanelStyleParams): React.CSSProperties {
  const {
    bubbleHeight,
    panelHeight,
    panelWidth,
    openToRight,
    position,
    defaultBubbleSize,
    margin,
  } = params;

  const sideGap = 12;
  const style: React.CSSProperties = { width: panelWidth };
  const bubbleSize = bubbleHeight || defaultBubbleSize;

  if (openToRight) {
    style.left = bubbleSize + sideGap;
    style.right = 'auto';
  } else {
    style.left = 'auto';
    style.right = bubbleSize + sideGap;
  }

  let desiredTop = bubbleSize - panelHeight;
  try {
    const winH = window.innerHeight;
    const minTop = margin - position.y;
    const maxTop = winH - margin - position.y - panelHeight;
    desiredTop = Math.min(Math.max(desiredTop, minTop), maxTop);
  } catch {}

  style.top = desiredTop;
  return style;
}

export async function requestChatReply(
  message: string,
  history: ChatMessage[],
): Promise<string> {
  const headers = await buildAuthorizedJsonHeaders();
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      message,
      history: history.slice(-20),
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorText = typeof data?.error === 'string' ? data.error : 'Chat request failed.';
    const hint = typeof data?.hint === 'string' ? ` ${data.hint}` : '';
    const details = typeof data?.details === 'string' && data.details ? ` ${data.details}` : '';
    const model = typeof data?.model === 'string' ? ` (model: ${data.model})` : '';
    throw new Error(`${errorText}${model}${hint}${details}`.trim());
  }

  return typeof data?.text === 'string' ? data.text : 'Sorry, I had trouble responding.';
}
