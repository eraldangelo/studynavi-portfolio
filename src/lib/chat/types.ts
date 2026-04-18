/**
 * Chat module type definitions
 */

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatPayload = {
  message?: string;
  history?: ChatMessage[];
  input?: string;
  text?: string;
};

export type ChatResponse = {
  text: string;
  searchPerformed: boolean;
  searchEnabled: boolean;
};

export type ChatErrorResponse = {
  error: string;
  details?: string;
  hint?: string;
  model?: string;
};
