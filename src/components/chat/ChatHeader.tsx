import { motion } from 'motion/react';
import { Bot, ChevronDown, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onReset: () => void;
  onToggleExpand: () => void;
  isExpanded: boolean;
  connectionStatus: 'connected' | 'connecting' | 'error';
}

/**
 * Component for the chat window header.
 * Displays the bot name, connection status, and action buttons (reset, expand, close).
 */
export function ChatHeader({ onClose, onReset, onToggleExpand, isExpanded, connectionStatus }: ChatHeaderProps) {
  // Colors mapped to the current connection state
  const statusColors = {
    connected: 'bg-emerald-500',
    connecting: 'bg-orange-500',
    error: 'bg-red-500'
  };

  const ringColors = {
    connected: 'bg-emerald-400',
    connecting: 'bg-orange-400',
    error: 'bg-red-400'
  };

  return (
    <header className="bg-elitc-gold p-5 flex items-center justify-between text-white shadow-lg z-10 relative overflow-hidden shrink-0">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      {/* Left side: Avatar and bot name/status */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center border border-white/50">
          <Bot className="w-6 h-6 text-elitc-gold" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight leading-none mb-1.5 text-zinc-900">
            ELITC Assistant
          </h1>
          <div className="flex items-center gap-2">
            {/* Animated status indicator dot */}
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ringColors[connectionStatus]} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColors[connectionStatus]}`}></span>
            </div>
            <span className="text-[10px] text-zinc-800 font-bold uppercase tracking-[2px]">{connectionStatus}</span>
          </div>
        </div>
      </div>

      {/* Right side: Action controls */}
      <div className="flex items-center gap-1 relative z-10">
        {/* Reset Chat: Clears message history and returns to welcome state */}
        <button 
          onClick={onReset}
          className="p-2 hover:bg-white/30 rounded-full transition-all text-zinc-900 group"
          title="Reset Chat"
        >
          <RotateCcw className="w-4 h-4 group-hover:rotate-[-45deg] transition-transform" />
        </button>
        {/* Toggle Expand: Switches between mini-window and large-window mode */}
        <button 
          onClick={onToggleExpand}
          className="p-2 hover:bg-white/30 rounded-full transition-all text-zinc-900 group"
          title={isExpanded ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
        {/* Close Chat: Minimizes the chat window */}
        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/30 rounded-full transition-all text-zinc-900 group"
          title="Close Chat"
        >
          <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
}
