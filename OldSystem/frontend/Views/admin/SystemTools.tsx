import React from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface SystemToolsProps {
  onMigrate: () => void;
  migrationLoading: boolean;
  migrationStatus: { type: 'idle' | 'success' | 'error'; message: string };
  stats: { courses: number; configs: number };
}

export const SystemTools: React.FC<SystemToolsProps> = ({
  onMigrate,
  migrationLoading,
  migrationStatus,
  stats
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-lg">Initial Data Migration</h3>
            <p className="text-sm text-zinc-500">Seed your Firestore database with the built-in course catalog and default bot instructions.</p>
          </div>
        </div>

        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 mb-8">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Warning:</strong> This will attempt to merge and update existing records. It is recommended to perform this only once during setup or when the catalog needs a full reset from the code defaults.
          </p>
        </div>

        <button
          onClick={onMigrate}
          disabled={migrationLoading}
          className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 hover:shadow-xl transition-all disabled:opacity-50 ring-offset-2 focus:ring-2 focus:ring-elitc-gold/50 cursor-pointer"
        >
          {migrationLoading ? (
            <>
              <RefreshCw className="w-6 h-6 animate-spin text-elitc-gold" />
              <span className="animate-pulse">Processing Batch...</span>
            </>
          ) : migrationStatus.type === 'success' ? (
            <>
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Synchronization Complete</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 text-elitc-gold fill-elitc-gold" />
              <span>Synchronize Database</span>
            </>
          )}
        </button>

        {migrationStatus.type !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-xl flex items-center gap-3 text-sm ${
              migrationStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {migrationStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {migrationStatus.message}
          </motion.div>
        )}
      </div>

      <div className="p-8 bg-white rounded-3xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 text-lg">Database Health</h3>
            <p className="text-sm text-zinc-500">Current active collections and record counts.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Courses</p>
              <p className="text-2xl font-bold text-zinc-900">{stats.courses}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Configs</p>
              <p className="text-2xl font-bold text-zinc-900">{stats.configs}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
};
