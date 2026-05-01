import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, ChevronDown } from 'lucide-react';

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
        className={`w-14 h-14 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] flex items-center justify-center transition-all duration-500 relative overflow-hidden group ${
          isOpen ? 'bg-zinc-900' : 'bg-elitc-gold'
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
            >
              <ChevronDown className="w-7 h-7 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0, scale: 0.8 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.8 }}
              className="relative"
            >
              <MessageSquare className="w-7 h-7 text-white fill-white/10" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
