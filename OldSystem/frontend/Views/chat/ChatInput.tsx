import { motion } from 'motion/react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Component for the chat input field and send button.
 * Disables input during loading states and handles form submission.
 */
export function ChatInput({ input, isLoading, onInputChange, onSubmit }: ChatInputProps) {
  return (
    <form 
      onSubmit={onSubmit}
      className="p-6 bg-white border-t border-zinc-100 shrink-0 relative"
    >
      <div className="relative flex items-center group">
        {/* Main Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Ask about courses, location, or subsidies..."
          disabled={isLoading}
          className="w-full bg-zinc-50 border border-zinc-200/80 rounded-full pl-6 pr-14 py-4 text-[14px] 
            focus:outline-none focus:ring-4 focus:ring-elitc-gold/10 focus:border-elitc-gold focus:bg-white 
            transition-all duration-300 disabled:opacity-50 placeholder:text-zinc-400 
            shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] focus:shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)]"
        />
        {/* Send Button: Changes to a spinner when the bot is thinking/responding */}
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 4px 15px -1px rgba(212,175,55,0.4)' }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={!input.trim() || isLoading}
          className="absolute right-2 p-3 bg-elitc-gold text-white rounded-full hover:bg-elitc-gold-dark 
            transition-all disabled:bg-zinc-200 disabled:text-zinc-400 shadow-md active:scale-95 flex items-center justify-center"
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
