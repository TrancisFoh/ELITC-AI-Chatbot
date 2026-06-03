import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight } from 'lucide-react';

interface ScrollAssistProps {
  isVisible: boolean;
  onScrollToBottom: () => void;
}

/**
 * Component for the "Scroll to Bottom" helper button.
 * Appears when the user has scrolled up away from the most recent messages.
 */
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
          {/* Using ChevronRight rotated 90deg to represent a "down" arrow */}
          <ChevronRight className="w-4 h-4 rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
