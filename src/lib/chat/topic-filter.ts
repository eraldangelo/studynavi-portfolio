/**
 * Topic filter for chat messages
 * Ensures the chatbot only answers education consultancy related questions
 */

/**
 * Off-topic patterns that should be rejected
 */
const OFF_TOPIC_PATTERNS = [
  // Weather
  /\b(weather|temperature|rain|sunny|cloudy|forecast|humidity)\b/i,
  
  // Entertainment
  /\b(movie|film|song|music|album|artist|singer|band|netflix|spotify|youtube|anime|manga|game|gaming)\b/i,
  /\b(recommend.*(movie|song|music|show|series|book|novel))/i,
  /\b(watch|listen|play).*(recommend|suggest)/i,
  
  // Food & Restaurants
  /\b(restaurant|food|recipe|cook|eat|dinner|lunch|breakfast|cafe|coffee shop)\b/i,
  /\b(hungry|crave|craving|delicious|yummy)\b/i,
  
  // Dating & Relationships
  /\b(date|dating|boyfriend|girlfriend|crush|love life|relationship advice)\b/i,
  
  // Sports & Fitness
  /\b(basketball|football|soccer|volleyball|gym|workout|exercise|nba|pba|uaap)\b/i,
  
  // Shopping & Fashion
  /\b(shopping|buy|purchase|sale|discount|fashion|clothes|outfit|dress|shoes)\b/i,
  /\b(lazada|shopee|zalora|uniqlo)\b/i,
  
  // News & Politics
  /\b(news|politics|election|president|senator|government|war|conflict)\b/i,
  
  // Tech products (non-education)
  /\b(iphone|android|samsung|laptop|computer|gadget|phone|smartphone)\b.*\b(buy|recommend|best|review)\b/i,
  
  // Personal advice (non-career)
  /\b(life advice|personal problem|family issue|friend drama)\b/i,
  
  // Random chat
  /\b(tell me a joke|make me laugh|funny|meme|bored|entertain me)\b/i,
  /\b(how are you|what's up|wassup|how's your day)\b/i,
  /\b(who are you|what are you|are you real|are you ai|are you human)\b/i,
  
  // Coding/Programming (unless education-related)
  /\b(code|coding|programming|javascript|python|react)\b(?!.*(course|study|learn|school|university|degree))/i,
];

/**
 * Education-related keywords that should ALWAYS be allowed
 * These override off-topic patterns if found
 */
const EDUCATION_KEYWORDS = [
  'study', 'school', 'university', 'college', 'course', 'program', 'degree',
  'visa', 'student visa', 'admission', 'enrollment', 'enroll', 'apply', 'application',
  'ielts', 'toefl', 'pte', 'duolingo', 'english test', 'language test',
  'scholarship', 'tuition', 'fee', 'cost', 'requirement', 'document',
  'australia', 'canada', 'new zealand', 'ireland', 'germany',
  'partner', 'abroad', 'overseas', 'international student',
  'diploma', 'bachelor', 'master', 'phd', 'doctorate', 'certificate',
  'intake', 'semester', 'term', 'academic', 'education',
  'career', 'job', 'work permit', 'post-study', 'immigration',
  'accommodation', 'housing', 'dormitory', 'living cost',
  'hospitality', 'nursing', 'business', 'engineering', 'it', 'accounting',
  // Dependents & Family
  'dependent', 'dependents', 'spouse', 'husband', 'wife', 'partner', 'child', 'children',
  'family', 'bring family', 'bring spouse', 'bring kids', 'accompanying', 'dependent visa',
  'spouse visa', 'partner visa', 'family visa', 'genuine student', 'gsr', 'gs requirement',
];

/**
 * Check if a message is off-topic (not related to education consultancy)
 */
export function isOffTopicQuery(message: string): boolean {
  const lower = message.toLowerCase();
  
  // First check if the message contains education keywords - if so, allow it
  const hasEducationKeyword = EDUCATION_KEYWORDS.some(kw => lower.includes(kw));
  if (hasEducationKeyword) {
    return false; // Not off-topic, allow the query
  }
  
  // Check against off-topic patterns
  const matchesOffTopic = OFF_TOPIC_PATTERNS.some(pattern => pattern.test(message));
  
  return matchesOffTopic;
}

/**
 * Get the polite refusal message for off-topic queries
 */
export function getOffTopicResponse(): string {
  return `I appreciate your question, but I'm specifically designed to help with **study abroad consultancy** for Filipino students.

I can assist you with:

• School and university recommendations (Australia, Canada, New Zealand, Ireland, Germany)

• Visa requirements and application processes

• English test preparation (IELTS, PTE, TOEFL, Duolingo)

• Tuition fees, scholarships, and living costs

• Course and program selection

• Document requirements and timelines

Is there anything about studying abroad that I can help you with?`;
}
