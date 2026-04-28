import { motion, AnimatePresence } from 'motion/react';
import { useChatController } from './hooks/useChatController';
import { ChatHeader } from './components/chat/ChatHeader';
import { MessageList } from './components/chat/MessageList';
import { SuggestedReplies } from './components/chat/SuggestedReplies';
import { ChatInput } from './components/chat/ChatInput';
import { FloatingToggle } from './components/chat/FloatingToggle';
import { ScrollAssist } from './components/chat/ScrollAssist';

export default function App() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    connectionStatus,
    isOpen,
    setIsOpen,
    suggestedReplies,
    scrollRef,
    showScrollButton,
    handleSend,
    resetChat,
    scrollToBottom,
    markMessageComplete
  } = useChatController();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans selection:bg-elitc-gold/30">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: 'blur(10px)' }}
            className="mb-4 w-[400px] h-[640px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-200/50 flex flex-col overflow-hidden relative"
          >
            <ChatHeader 
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsOpen(false)}
              connectionStatus={connectionStatus}
            />

            <MessageList 
              messages={messages}
              isLoading={isLoading}
              scrollRef={scrollRef}
              onMarkComplete={markMessageComplete}
            />

            <SuggestedReplies 
              replies={suggestedReplies}
              isVisible={!isLoading && messages[messages.length - 1]?.isComplete === true}
              onSelect={handleSend}
            />

            <ScrollAssist 
              isVisible={showScrollButton} 
              onScrollToBottom={scrollToBottom} 
            />

            <ChatInput 
              input={input}
              isLoading={isLoading}
              onInputChange={setInput}
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <FloatingToggle 
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}
