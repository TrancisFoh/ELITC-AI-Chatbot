import React, { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
import { Config } from '../../types';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../../services/gemini';

interface ConfigManagerProps {
  configs: Config[];
  onSave: (config: Partial<Config>) => Promise<void>;
}

export const ConfigManager: React.FC<ConfigManagerProps> = ({ configs, onSave }) => {
  const [prompt, setPrompt] = useState(DEFAULT_SYSTEM_INSTRUCTION);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const systemPromptConfig = configs.find(c => c.key === 'SYSTEM_PROMPT');
    if (systemPromptConfig?.value) {
      setPrompt(systemPromptConfig.value);
    }
  }, [configs]);

  const handleSave = async () => {
    setIsSaving(true);
    const existingConfig = configs.find(c => c.key === 'SYSTEM_PROMPT');
    await onSave({
      id: existingConfig?.id || 'config-1',
      key: 'SYSTEM_PROMPT',
      value: prompt
    });
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-900">AI Personality & Tone</h3>
                <p className="text-xs text-zinc-500 font-medium">Control how the bot interacts with users.</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-elitc-gold hover:bg-elitc-gold-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-elitc-gold/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Prompt'}
            </button>
          </div>
          <div className="space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={20}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-elitc-gold/5 focus:border-elitc-gold transition-all resize-none font-medium leading-relaxed font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
