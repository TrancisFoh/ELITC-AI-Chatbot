import { motion } from 'motion/react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ChatInput({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) {
  return (
    <form 
      onSubmit={onSubmit}
      className="p-6 bg-white border-t border-zinc-100 shrink-0"
    >
      <div className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about courses, location, or subsidies..."
          disabled={isLoading}
          className="w-full bg-zinc-50 border border-zinc-200/80 rounded-full pl-6 pr-14 py-4 text-[14px] focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all disabled:opacity-50 placeholder:text-zinc-400"
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2.5 p-2.5 bg-elitc-gold text-white rounded-full hover:bg-elitc-gold-dark transition-all disabled:bg-zinc-200 disabled:text-zinc-400 shadow-sm active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </motion.button>
      </div>
    </form>
  );
}
