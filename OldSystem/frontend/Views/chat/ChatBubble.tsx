import { motion } from 'motion/react';
import { Bot, User, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { CourseCarousel } from '../CourseCarousel';

interface ChatBubbleProps {
  message: Message;
}

/**
 * Component to render an individual chat message.
 * Handles styling for user messages, assistant messages, and error states.
 * Also renders a CourseCarousel if course data is attached to the message.
 */
export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar Icon (User vs Bot) */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
        isUser ? 'bg-zinc-900 border border-zinc-800' : 
        isError ? 'bg-rose-50 border border-rose-100' : 'bg-white border border-zinc-200'
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-zinc-400" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4 text-rose-500" />
        ) : (
          <Bot className="w-4 h-4 text-elitc-gold" />
        )}
      </div>

      <div id={`message-container-${message.id}`} className={`max-w-[85%] space-y-2 ${isUser ? 'text-right' : ''}`}>
        {/* Message Bubble */}
        <div 
          id={`message-bubble-${message.id}`}
          className={`inline-block px-5 py-3.5 rounded-[24px] text-[14px] leading-relaxed shadow-sm transition-all duration-300 ${
          isUser 
            ? 'bg-zinc-900 text-zinc-100 rounded-tr-none border border-zinc-800' 
            : isError
              ? 'bg-rose-50 border border-rose-100 text-rose-900 rounded-tl-none font-medium'
              : 'bg-white border border-zinc-200/80 text-zinc-800 rounded-tl-none font-medium'
        }`}>
          <div id={`message-content-${message.id}`} className="whitespace-pre-wrap prose prose-sm max-w-none prose-zinc prose-p:my-0 prose-a:text-elitc-gold prose-a:underline font-medium text-left">
            <div id={`markdown-wrapper-${message.id}`}>
              {/* Renders content as Markdown to support bold, lists, and links */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* If courses are attached, show the horizontal carousel */}
        {message.isComplete && message.courses && message.courses.length > 0 && (
          <div className="pt-1">
             <CourseCarousel courses={message.courses} />
          </div>
        )}

        {/* If location info is attached, show a Google Map pin/iframe */}
        {message.isComplete && message.location && (
          <div className="pt-1 rounded-2xl overflow-hidden border border-zinc-200 bg-white shadow-sm">
            <iframe
              title="ELITC Location"
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={message.location.mapUrl}
            ></iframe>
            <div className="p-3 bg-zinc-50 border-t border-zinc-100">
              <p className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-elitc-gold animate-pulse" />
                {message.location.address}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
