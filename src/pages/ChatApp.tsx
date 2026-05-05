import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useChatController } from '../hooks/useChatController';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { SuggestedReplies } from '../components/chat/SuggestedReplies';
import { ChatInput } from '../components/chat/ChatInput';
import { FloatingToggle } from '../components/chat/FloatingToggle';
import { ScrollAssist } from '../components/chat/ScrollAssist';

export default function ChatApp() {
  const {
    messages,
    input,
    setInput,
    isLoading,
    connectionStatus,
    isOpen,
    setIsOpen,
    isExpanded,
    setIsExpanded,
    suggestedReplies,
    scrollRef,
    showScrollButton,
    handleSend,
    resetChat,
    scrollToBottom,
  } = useChatController();

  return (
    <div className="font-sans selection:bg-elitc-gold/30">
      <AnimatePresence>
        {isOpen && (
          /* Background overlay when expanded to improve focus */
          <div className={`fixed inset-0 z-40 transition-all duration-500 ${isExpanded ? '' : 'pointer-events-none'}`}>
            <motion.div
              id="chat-window-container"
              initial={{ 
                opacity: 0, 
                scale: 0, 
                filter: 'blur(10px)' 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                filter: 'blur(0px)',
                width: isExpanded ? 'calc(100vw - 48px)' : '410px',
                height: isExpanded ? 'calc(100vh - 144px)' : '670px',
              }}
              exit={{ 
                opacity: 0, 
                scale: 0, 
                filter: 'blur(10px)' 
              }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              style={{ 
                position: 'fixed',
                transformOrigin: 'bottom right',
                bottom: '100px',
                right: '24px',
                borderRadius: '32px',
              }}
              className="bg-white shadow-[0_30px_90px_-10px_rgba(0,0,0,0.25),0_10px_30px_-5px_rgba(0,0,0,0.1)] border border-white/50 flex flex-col pointer-events-auto backdrop-blur-sm shadow-2xl overflow-hidden"
            >
              {/* Header: Handles closing, resetting chat, and toggling full-screen mode */}
              <div id="chat-header-wrapper">
                <ChatHeader 
                  onClose={() => setIsOpen(false)}
                  onReset={resetChat}
                  onToggleExpand={() => setIsExpanded(!isExpanded)}
                  isExpanded={isExpanded}
                  connectionStatus={connectionStatus}
                />
              </div>

              {/* Main Content Area: Displays messages and any injected course carousels */}
              <div id="message-list-wrapper" className="flex-1 overflow-hidden flex flex-col">
                <MessageList 
                  messages={messages}
                  isLoading={isLoading}
                  scrollRef={scrollRef}
                />
              </div>

              {/* Suggestion Pills: Quick-reply buttons shown after an AI response */}
              <SuggestedReplies 
                replies={suggestedReplies}
                isVisible={!isLoading && messages[messages.length - 1]?.isComplete === true}
                onSelect={handleSend}
              />

              {/* Scroll Button: Floating arrow to jump back to latest message if the user scrolled up */}
              <ScrollAssist 
                isVisible={showScrollButton} 
                onScrollToBottom={scrollToBottom} 
              />

              {/* Input Area: Text field and send button */}
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
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 right-6 z-50">
        <FloatingToggle 
          isOpen={isOpen}
          onToggle={() => setIsOpen(!isOpen)}
        />
      </div>
    </div>
  );
}
