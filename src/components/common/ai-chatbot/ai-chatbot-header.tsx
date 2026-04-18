import React from 'react';

export function AiChatbotHeader() {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-[#0a5cd6] via-[#1b79f5] to-[#34b3ff] px-4 py-3 text-white">
      <img
        src="/assets/ai-chatbot-avatar.svg"
        alt="AI Chatbot Avatar"
        className="h-9 w-9 rounded-full border-2 border-yellow-500 object-cover"
      />
      <div>
        <div className="text-sm font-semibold">StudyNavi Chatbot</div>
        <div className="text-[11px] text-white/80 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400 ring-2 ring-white/30" aria-hidden="true" />
          <span>Online</span>
        </div>
        <div className="text-[10px] text-white/70 mt-1">Powered by GPT-5 mini</div>
      </div>
    </div>
  );
}

export default AiChatbotHeader;
