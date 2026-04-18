import React from 'react';
import { ChatMessage } from './ai-chatbot-types';

export function parseMarkdownBold(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return linkifyString(text);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-semibold text-slate-800">
          {linkifyString(boldText)}
        </strong>
      );
    }
    return linkifyString(part);
  });
}

export function linkifyString(text: string): React.ReactNode {
  const urlRegex = /((https?:\/\/|www\.)[\w\-\.\/\?#\[\]@!$&'()*+,;=:%~]+)/gi;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const index = match.index;
    if (index > lastIndex) parts.push(text.slice(lastIndex, index));

    const href = url.startsWith('http') ? url : `https://${url}`;
    parts.push(
      <a
        key={`${href}-${index}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all"
      >
        {url}
      </a>
    );

    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  if (parts.length === 0) return text;
  return parts;
}

export function formatAssistantMessage(text: string): React.ReactNode {
  // Remove explicit citation markers like [1], [2,3]
  let cleaned = text.replace(/\s*\[\d+(?:,\s*\d+)*\]/g, '');

  // Remove any lines that explicitly attribute sources to external agencies.
  // We allow the backend to consult external agencies, but responses must not
  // display those agency names in the chat UI. Strip lines that begin with
  // "Source", "Sources", or contain common agency identifiers.
  const agencyPattern = /\b(aecc|ams|bada|idp|fortrust|nacac|uceap)\b/i;
  cleaned = cleaned
    .split(/\r?\n/)
    .filter((ln) => {
      if (/^\s*sources?\b[:\-\s]?/i.test(ln)) return false;
      if (agencyPattern.test(ln)) return false;
      return true;
    })
    .join('\n');
  cleaned = cleaned.replace(/[•·‣⁃]/g, '•');
  cleaned = cleaned.replace(/\s*•\s*/g, '\n• ');

  const lines = cleaned.split(/\n/).map(l => l.trim()).filter(Boolean);
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 ml-1 space-y-2">
          {currentList.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-[#0a5cd6] font-bold flex-shrink-0">•</span>
              <span className="flex-1">{item}</span>
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (const line of lines) {
    const bulletMatch = line.match(/^[•\-\*]\s*(.+)$/);
    if (bulletMatch) {
      currentList.push(parseMarkdownBold(bulletMatch[1]));
    } else {
      flushList();
      elements.push(
        <p key={`p-${elements.length}`} className="mb-2 last:mb-0">
          {parseMarkdownBold(line)}
        </p>
      );
    }
  }

  flushList();
  return <div className="space-y-1">{elements}</div>;
}

export default {} as unknown as { formatAssistantMessage: (t: string) => React.ReactNode };
