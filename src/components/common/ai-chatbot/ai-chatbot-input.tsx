import React from 'react';
import { Send } from 'lucide-react';

type Props = {
  input: string;
  setInput: (v: string) => void;
  handleSend: () => void;
  isSending: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
};

export default function AiChatbotInput({ input, setInput, handleSend, isSending, textareaRef }: Props) {
  return (
    <div className="border-t bg-white px-3 py-3">
      <div className="flex items-end gap-2 rounded-xl bg-[#f8fafc] px-2 py-2">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type your message..."
          className="flex-1 resize-none bg-transparent px-2 py-1 text-sm text-slate-800 outline-none min-h-[28px] max-h-[120px]"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            const ta = textareaRef.current;
            if (ta) {
              ta.style.height = 'auto';
              ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 text-black shadow-sm transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Send message"
          onClick={handleSend}
          disabled={isSending || !input.trim()}
        >
          <Send className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-1 px-2 w-full">
        <div className="text-[11px] text-slate-500 italic leading-4 text-center">StudyNavi Chatbot can make mistakes, so double-check it.</div>
      </div>
    </div>
  );
}
