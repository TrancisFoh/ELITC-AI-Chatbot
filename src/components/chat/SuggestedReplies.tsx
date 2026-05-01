import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface SuggestedRepliesProps {
  replies: string[];
  isVisible: boolean;
  onSelect: (reply: string) => void;
}

export function SuggestedReplies({ replies, isVisible, onSelect }: SuggestedRepliesProps) {
  return (
    <div className="bg-white px-4 pt-4 shrink-0 overflow-hidden">
      <AnimatePresence>
        {isVisible && replies.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto no-scrollbar pb-2"
          >
            {replies.map((reply) => {
              return (
                <motion.button
                  key={reply}
                  whileHover={{ scale: 1.02, backgroundColor: '#fdf8e9' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(reply)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full text-[12px] font-bold text-zinc-600 hover:border-elitc-gold hover:text-elitc-gold hover:shadow-sm transition-all active:scale-95 text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-elitc-gold shrink-0" />
                  <span>{reply}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
