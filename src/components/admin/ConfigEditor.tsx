import React from 'react';
import { X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Config } from '../../types';

interface ConfigEditorProps {
  config: Partial<Config> | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (config: Partial<Config>) => void;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onClose, onSave, onChange }) => {
  return (
    <AnimatePresence>
      {config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">System Instruction</h2>
                <p className="text-xs text-zinc-500 font-medium">Fine-tune the AI's response logic.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-all">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Identifier Key</label>
                <input
                  type="text"
                  placeholder="e.g. SYSTEM_PROMPT"
                  value={config.key || ''}
                  onChange={e => onChange({ ...config, key: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest px-1">Directive Value</label>
                <textarea
                  rows={12}
                  value={config.value || ''}
                  onChange={e => onChange({ ...config, value: e.target.value })}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all resize-none font-medium leading-relaxed"
                />
              </div>
            </div>

            <div className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-elitc-gold/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                Update Config
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
