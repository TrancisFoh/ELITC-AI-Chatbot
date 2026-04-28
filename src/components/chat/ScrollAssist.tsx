import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface ScrollAssistProps {
  isVisible: boolean;
  onScrollToBottom: () => void;
}

export function ScrollAssist({ isVisible, onScrollToBottom }: ScrollAssistProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={onScrollToBottom}
          className="absolute bottom-24 right-6 p-2 bg-white border border-zinc-200 rounded-full shadow-lg text-zinc-600 hover:text-elitc-gold transition-colors z-20"
        >
          <ChevronRight className="w-4 h-4 rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
