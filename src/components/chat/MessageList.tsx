import { RefObject } from 'react';
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
  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 scroll-smooth no-scrollbar"
    >
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <ChatBubble 
            key={message.id} 
            message={message} 
            onComplete={onMarkComplete} 
          />
        ))}
      </AnimatePresence>

      {isLoading && (
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
  );
}
