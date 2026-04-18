/**
 * Detect if the user's message requests image or video generation
 */
export function isMediaRequest(message: string): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return /\b(image|photo|picture|generate image|create image|create video|generate video|video|gif|png|jpeg|jpg|midjourney|dall[e']?|stable diffusion|sdxl)\b/.test(m);
}

/**
 * Detect if the user's message requests grammar/editing/proofreading or composition of personal texts
 */
export function isProhibitedTextRequest(message: string): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return /\b(grammar|proofread|proofreading|proof-read|proof read|check grammar|correct my|correct the|edit my|revise my|rewrite my|write my email|compose email|compose an email|write an email|cover letter|statement of purpose|sop|personal statement|motivation letter|application essay)\b/.test(m);
}
