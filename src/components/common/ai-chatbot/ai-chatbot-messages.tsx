import React from 'react';
import type { ChatMessage } from './ai-chatbot-types';
import { formatAssistantMessage } from './ai-chatbot-utils';

type Props = {
  messages: ChatMessage[];
  isSending: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

export default function AiChatbotMessages({ messages, isSending, messagesEndRef }: Props) {
  return (
    <div className="flex-1 min-h-0 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-3">
      {messages.map((msg, index) => {
        if (msg.role === 'assistant') {
          return (
            <div key={`assistant-${index}`} className="flex items-start gap-3 mr-auto max-w-[85%]">
              <img
                src="/assets/ai-chatbot-avatar.svg"
                alt="AI Chatbot Avatar"
                className="h-8 w-8 rounded-full border-2 border-[#0a5cd6] flex-shrink-0 self-start"
              />
              <div className="rounded-xl bg-[#f4f7ff] p-3 text-xs text-slate-700 break-words whitespace-pre-wrap">
                {formatAssistantMessage(msg.content)}
              </div>
            </div>
          );
        }

        return (
          <div key={`user-wrap-${index}`} className="flex justify-end">
            <div key={`user-${index}`} className="inline-block max-w-[70%] rounded-xl bg-[#0a5cd6] px-3 py-2 text-xs text-white whitespace-pre-wrap break-words">
              {msg.content}
            </div>
          </div>
        );
      })}

      {isSending && (
        <div className="flex items-start gap-3 mr-auto max-w-[85%]">
          <img
            src="/assets/ai-chatbot-avatar.svg"
            alt="AI Chatbot Avatar"
            className="h-8 w-8 rounded-full border-2 border-[#0a5cd6] flex-shrink-0 self-start"
          />
          <div className="rounded-xl bg-[#f4f7ff] p-3 text-xs text-slate-700 break-words whitespace-pre-wrap">
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms', animationDuration: '600ms' }} />
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms', animationDuration: '600ms' }} />
              <span className="inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms', animationDuration: '600ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
