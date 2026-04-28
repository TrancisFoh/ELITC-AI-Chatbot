import { motion } from 'motion/react';
import { Bot, X, ChevronRight } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize: () => void;
  connectionStatus: 'connected' | 'connecting' | 'error';
}

export function ChatHeader({ onClose, onMinimize, connectionStatus }: ChatHeaderProps) {
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
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-10 h-10 bg-white shadow-inner rounded-2xl flex items-center justify-center">
          <Bot className="w-6 h-6 text-elitc-gold" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight leading-none mb-1 text-zinc-900">
            ELITC Assistant
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${ringColors[connectionStatus]} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusColors[connectionStatus]}`}></span>
            </div>
            <span className="text-[10px] text-zinc-800 font-bold uppercase tracking-[2px]">{connectionStatus}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-10">
        <button 
          onClick={onMinimize}
          className="p-2 hover:bg-white/20 rounded-xl transition-all border border-transparent hover:border-white/20 shadow-sm text-zinc-900 group"
          title="Minimize"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform rotate-90" />
        </button>
      </div>
    </header>
  );
}
