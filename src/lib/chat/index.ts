/**
 * Chat module - barrel export
 * All chat-related utilities and configurations
 */

// Types
export type { ChatMessage, ChatPayload, ChatResponse, ChatErrorResponse } from './types';

// System prompt
export { SYSTEM_PROMPT } from './system-prompt';

// Partner school utilities
export { 
  isSchoolRecommendationQuery, 
  findMentionedPartnerSchools,
  searchPartnerSchools, 
  formatPartnerSchoolsForPrompt 
} from './partner-schools';

// Output sanitization
export { sanitizeToPhilippines, removeCitations } from './sanitize';

// Topic filter
export { isOffTopicQuery, getOffTopicResponse } from './topic-filter';

// Corrections memory
export { loadCorrections, saveCorrection, formatCorrectionsForPrompt } from './corrections';
export type { Correction } from './corrections';
