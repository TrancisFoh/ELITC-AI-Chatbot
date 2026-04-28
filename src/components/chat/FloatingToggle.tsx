import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ChevronRight } from 'lucide-react';

interface FloatingToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FloatingToggle({ isOpen, onToggle }: FloatingToggleProps) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-elitc-gold rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`w-16 h-16 rounded-full shadow-[0_10px_30px_rgba(219,172,53,0.3)] flex items-center justify-center transition-all duration-300 relative overflow-hidden group ${
          isOpen ? 'bg-zinc-900 rotate-90' : 'bg-elitc-gold'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <ChevronRight className="w-7 h-7 text-white rotate-180" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageSquare className="w-7 h-7 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-elitc-gold rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
