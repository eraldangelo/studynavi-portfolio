"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { ChatMessage } from './ai-chatbot-types';
import AiChatbotHeader from './ai-chatbot-header';
import AiChatbotMessages from './ai-chatbot-messages';
import AiChatbotInput from './ai-chatbot-input';
import { computePanelStyle, requestChatReply } from './ai-chatbot-bubble.utils';
const DEFAULT_BUBBLE_SIZE = 56;
const MARGIN = 16;
const PANEL_WIDTH = 360;
type Position = { x: number; y: number };
type DragState = {
  pointerId: number | null;
  offsetX: number;
  offsetY: number;
};
export default function AiChatbotBubble() {
  const bubbleRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isOpen, setIsOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= 768
  );
  const [position, setPosition] = useState<Position>(() => ({
    x: typeof window === 'undefined' ? 0 : window.innerWidth - DEFAULT_BUBBLE_SIZE - MARGIN,
    y: typeof window === 'undefined' ? 0 : window.innerHeight - DEFAULT_BUBBLE_SIZE - MARGIN,
  }));
  const [drag, setDrag] = useState<DragState>({ pointerId: null, offsetX: 0, offsetY: 0 });
  const dragMovedRef = useRef(false);
  const draggingRef = useRef(false);
  const [panelPlacement, setPanelPlacement] = useState({ openToRight: true, openAbove: true });
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m StudyNavi Chatbot. Ask me anything about partner schools, fees, bringing dependents. Feel free to chat if you are confused.' },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [bubbleHeight, setBubbleHeight] = useState<number>(DEFAULT_BUBBLE_SIZE);
  const [panelHeight, setPanelHeight] = useState<number>(600);
  const [panelWidth, setPanelWidth] = useState<number>(PANEL_WIDTH);
  const computePanelWidth = useCallback(() => {
    if (typeof window === 'undefined') return PANEL_WIDTH;
    return Math.max(240, Math.min(PANEL_WIDTH, window.innerWidth - MARGIN * 2));
  }, []);
  const clampPosition = useCallback((pos: Position) => {
    const bubbleSz = bubbleHeight || DEFAULT_BUBBLE_SIZE;
    const maxX = Math.max(MARGIN, window.innerWidth - bubbleSz - MARGIN);
    const maxY = Math.max(MARGIN, window.innerHeight - bubbleSz - MARGIN);
    return {
      x: Math.min(Math.max(pos.x, MARGIN), maxX),
      y: Math.min(Math.max(pos.y, MARGIN), maxY),
    };
  }, [bubbleHeight]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);
  const measureSizes = useCallback(() => {
    try {
      if (bubbleRef.current) {
        const h = bubbleRef.current.getBoundingClientRect().height;
        if (h && h !== bubbleHeight) setBubbleHeight(h);
      }
      if (panelRef.current) {
        const ph = panelRef.current.getBoundingClientRect().height;
        if (ph && ph !== panelHeight) setPanelHeight(ph);
      }
    } catch {}
  }, [bubbleHeight, panelHeight]);
  useEffect(() => {
    const handleResize = () => {
      setPanelWidth(computePanelWidth());
      setPosition((prev) => clampPosition(prev));
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('resize', measureSizes);
    setPanelWidth(computePanelWidth());
    if (window.innerWidth < 640) {
      setIsOpen(false);
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', measureSizes);
    };
  }, [clampPosition, computePanelWidth, measureSizes]);
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => {
      measureSizes();
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [isOpen, measureSizes]);
  useEffect(() => {
    measureSizes();
  }, [isOpen, messages, measureSizes]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const bubbleSz = bubbleHeight || DEFAULT_BUBBLE_SIZE;
    const spaceLeft = position.x;
    const spaceRight = window.innerWidth - (position.x + bubbleSz);
    const spaceAbove = position.y;
    const spaceBelow = window.innerHeight - (position.y + bubbleSz);
    const openToRight = spaceRight >= panelWidth ? true : spaceLeft >= panelWidth ? false : true;
    const openAbove = spaceAbove >= panelHeight ? true : spaceBelow >= panelHeight ? false : true;
    setPanelPlacement({ openToRight, openAbove });
  }, [position.x, position.y, bubbleHeight, panelHeight, panelWidth]);
  const panelStyle: React.CSSProperties = computePanelStyle({
    bubbleHeight,
    panelHeight,
    panelWidth,
    openToRight: panelPlacement.openToRight,
    position,
    defaultBubbleSize: DEFAULT_BUBBLE_SIZE,
    margin: MARGIN,
  });
  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (!bubbleRef.current) return;
    dragMovedRef.current = false;
    bubbleRef.current.setPointerCapture(event.pointerId);
    const rect = bubbleRef.current.getBoundingClientRect();
    setDrag({
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
    });
    draggingRef.current = true;
    window.addEventListener('pointermove', handleWindowPointerMove as any);
    window.addEventListener('pointerup', handleWindowPointerUp as any);
  };
  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.pointerId !== event.pointerId) return;
    const next = clampPosition({
      x: event.clientX - drag.offsetX,
      y: event.clientY - drag.offsetY,
    });
    const dx = Math.abs(event.clientX - (drag.offsetX + position.x));
    const dy = Math.abs(event.clientY - (drag.offsetY + position.y));
    if (Math.hypot(dx, dy) > 6) dragMovedRef.current = true;
    setPosition(next);
  };
  const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    if (drag.pointerId !== event.pointerId) return;
    if (bubbleRef.current) {
      bubbleRef.current.releasePointerCapture(event.pointerId);
    }
    setDrag({ pointerId: null, offsetX: 0, offsetY: 0 });
  };
  const handleWindowPointerMove = (event: globalThis.PointerEvent) => {
    if (!draggingRef.current) return;
    const { offsetX, offsetY } = drag;
    const next = clampPosition({
      x: event.clientX - offsetX,
      y: event.clientY - offsetY,
    });
    const dx = Math.abs(event.clientX - (offsetX + position.x));
    const dy = Math.abs(event.clientY - (offsetY + position.y));
    if (Math.hypot(dx, dy) > 6) dragMovedRef.current = true;
    setPosition(next);
  };
  const handleWindowPointerUp = (event: globalThis.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    try {
      if (bubbleRef.current && drag.pointerId !== null) {
        bubbleRef.current.releasePointerCapture(drag.pointerId);
      }
    } catch {}
    setDrag({ pointerId: null, offsetX: 0, offsetY: 0 });
    window.removeEventListener('pointermove', handleWindowPointerMove as any);
    window.removeEventListener('pointerup', handleWindowPointerUp as any);
  };
  const handleBubbleClick = () => {
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    setIsOpen((prev) => !prev);
  };
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsSending(true);
    try {
      const replyText = await requestChatReply(trimmed, messages as ChatMessage[]);
      setMessages((prev) => [...prev, { role: 'assistant', content: replyText }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sorry, I ran into an error.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: message },
      ]);
    } finally {
      setIsSending(false);
    }
  };
  return (
    <div className="fixed z-50" style={{ left: position.x, top: position.y }}>
      {isOpen && (
        <div
          ref={panelRef}
          className="absolute max-h-[calc(100vh-2rem)] overflow-hidden rounded-2xl border bg-white shadow-xl flex flex-col"
          style={panelStyle}
        >
          <AiChatbotHeader />
          <AiChatbotMessages messages={messages} isSending={isSending} messagesEndRef={messagesEndRef} />
          <AiChatbotInput input={input} setInput={setInput} handleSend={handleSend} isSending={isSending} textareaRef={textareaRef} />
        </div>
      )}
      <button
        ref={bubbleRef}
        type="button"
        aria-label={isOpen ? 'Close AI chatbot' : 'Open AI chatbot'}
        className="relative inline-block p-0 bg-transparent text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a5cd6] focus-visible:ring-offset-0"
        style={{ touchAction: 'none' }}
        onClick={handleBubbleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <img
          src="/assets/ai-chatbot-avatar.svg"
          alt="AI Chatbot Avatar"
          className="relative h-14 w-14 sm:h-[5.2rem] sm:w-[5.2rem] object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
        />
      </button>
    </div>
  );
}
