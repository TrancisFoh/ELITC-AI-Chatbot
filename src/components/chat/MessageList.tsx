import { RefObject, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Bot } from 'lucide-react';
import { Message } from '../../types';
import { ChatBubble } from './ChatBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  onMarkComplete: (id: string) => void;
}

export function MessageList({ messages, isLoading, scrollRef, onMarkComplete }: MessageListProps) {
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    // Auto-scroll logic when content changes height (e.g. during typing)
    const observer = new ResizeObserver(() => {
      const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
      if (isAtBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: 'auto' });
      }
    });

    // Observe the internal wrapper for size changes
    const wrapper = container.querySelector('.messages-content-wrapper');
    if (wrapper) {
      observer.observe(wrapper);
    }

    return () => observer.disconnect();
  }, [scrollRef]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scroll-smooth no-scrollbar relative"
    >
      <div className="messages-content-wrapper space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <ChatBubble 
              key={message.id} 
              message={message} 
              onComplete={onMarkComplete} 
            />
          ))}
        </AnimatePresence>

        {/* Show typing indicator only when waiting for the first chunk of a new message */}
        {isLoading && !messages.some(m => m.id === messages[messages.length - 1]?.id && m.role === 'assistant' && !m.isComplete) && (
          <div className="flex gap-3.5">
            <div className="w-8 h-8 rounded-[12px] bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
              <Bot className="w-4 h-4 text-elitc-gold" />
            </div>
            <div className="bg-white border border-zinc-100 rounded-[20px] rounded-tl-none px-4 py-2.5 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-elitc-gold/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-elitc-gold/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-elitc-gold/40 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
