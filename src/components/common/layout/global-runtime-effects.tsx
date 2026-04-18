'use client';

import { useEffect } from 'react';

const CHAT_IFRAME_HINTS = ['chat', 'widget', 'studynavi', 'assistant', 'intercom', 'crisp', 'tawk', 'hubspot', 'drift'];

function resizeChatWidget() {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const src = iframe.src || '';
    if (CHAT_IFRAME_HINTS.some((hint) => src.includes(hint))) {
      iframe.style.height = '800px';
      iframe.style.maxHeight = '95vh';
      iframe.style.minHeight = '700px';
    }
  });

  const containers = document.querySelectorAll('[class*="chat"], [class*="widget"], [id*="chat"], [id*="widget"]');
  containers.forEach((element) => {
    if (element.tagName === 'IFRAME' || element.querySelector('iframe')) {
      const htmlElement = element as HTMLElement;
      htmlElement.style.height = '800px';
      htmlElement.style.maxHeight = '95vh';
      htmlElement.style.minHeight = '700px';
    }
  });
}

export function GlobalRuntimeEffects() {
  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();

    document.addEventListener('contextmenu', preventContextMenu);
    if (document.readyState === 'complete') {
      resizeChatWidget();
    } else {
      window.addEventListener('load', resizeChatWidget);
    }
    const interval = window.setInterval(resizeChatWidget, 2000);

    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('load', resizeChatWidget);
      window.clearInterval(interval);
    };
  }, []);

  return null;
}
