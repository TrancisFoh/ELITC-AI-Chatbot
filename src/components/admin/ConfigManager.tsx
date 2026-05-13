import React from 'react';
import { Settings, Plus } from 'lucide-react';
import { Config } from '../../types';

interface ConfigManagerProps {
  configs: Config[];
  onEdit: (config: Config) => void;
  onAdd: () => void;
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({ configs, onEdit, onAdd }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-elitc-gold/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Config
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900">AI Personality & Tone</h3>
              <p className="text-xs text-zinc-500 font-medium">Control how the bot interacts with users.</p>
            </div>
          </div>
          <div className="space-y-4">
            {configs.map(config => (
              <div key={config.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{config.key}</span>
                  <button
                    onClick={() => onEdit(config)}
                    className="text-elitc-gold text-xs font-bold hover:underline"
                  >
                    Edit Value
                  </button>
                </div>
                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{config.value}</p>
              </div>
            ))}
            {configs.length === 0 && (
              <div className="text-center py-10">
                <p className="text-zinc-400 text-sm">No configurations found. Add your first instruction to calibrate the AI.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
