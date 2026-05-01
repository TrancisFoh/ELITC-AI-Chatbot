import { motion } from 'motion/react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { Typewriter } from '../Typewriter';
import { CourseCarousel } from '../CourseCarousel';

interface ChatBubbleProps {
  message: Message;
  onComplete: (id: string) => void;
}

export function ChatBubble({ message, onComplete }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
        isUser ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-zinc-400" />
        ) : (
          <Bot className="w-4 h-4 text-elitc-gold" />
        )}
      </div>
      <div id={`message-container-${message.id}`} className={`max-w-[85%] space-y-2 ${isUser ? 'text-right' : ''}`}>
        <div 
          id={`message-bubble-${message.id}`}
          className={`inline-block px-5 py-3.5 rounded-[24px] text-[14px] leading-relaxed shadow-sm transition-all duration-300 ${
          isUser 
            ? 'bg-zinc-900 text-zinc-100 rounded-tr-none border border-zinc-800' 
            : 'bg-white border border-zinc-200/80 text-zinc-800 rounded-tl-none font-medium'
        }`}>
          <div id={`message-content-${message.id}`} className="whitespace-pre-wrap prose prose-sm max-w-none prose-zinc prose-p:my-0 prose-a:text-elitc-gold prose-a:underline font-medium text-left">
            {!isUser && message.id !== 'welcome' && !message.isComplete ? (
              <Typewriter 
                text={message.content} 
                onComplete={() => onComplete(message.id)} 
              />
            ) : (
              <div id={`markdown-wrapper-${message.id}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>

        {message.isComplete && message.courses && message.courses.length > 0 && (
          <div className="pt-1">
             <CourseCarousel courses={message.courses} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
