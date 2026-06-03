import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { 
  Search, 
  AlertOctagon, 
  Clock, 
  RefreshCw, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink,
  Code,
  Terminal,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorLog {
  id: string;
  session_id: string | null;
  error_message: string;
  stack_trace: string | null;
  component: string;
  timestamp: number;
}

interface ErrorLogManagerProps {
  onViewChatSession: (sessionId: string) => void;
}

export function ErrorLogManager({ onViewChatSession }: ErrorLogManagerProps) {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await dbService.getErrorLogs();
      setLogs(data);
      // Auto select first log if none selected and logs are present
      if (data.length > 0 && !selectedLog) {
        // Find if we already had a selected log and preserve or just set first
        setSelectedLog(data[0]);
      }
    } catch (e) {
      console.error("Failed to load error logs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all error logs?")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await dbService.clearErrorLogs();
      if (success) {
        setLogs([]);
        setSelectedLog(null);
        alert("🗑️ Error logs cleared successfully!");
      }
    } catch (e) {
      console.error("Failed to clear error logs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyStack = (stack: string) => {
    navigator.clipboard.writeText(stack);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.session_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFullDate = (ts: number) => {
    const d = new Date(Number(ts));
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-210px)] min-h-[500px]">
      {/* Left Pane: Error List */}
      <div className="w-full lg:w-96 flex flex-col bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-100 flex flex-col gap-4 bg-zinc-50/50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-rose-500" />
              Runtime Errors
            </h3>
            <div className="flex items-center gap-1">
              <button 
                onClick={fetchLogs} 
                disabled={isLoading}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh error logs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              {logs.length > 0 && (
                <button 
                  onClick={handleClearLogs} 
                  disabled={isLoading}
                  className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Clear all error logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search error message, component..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Scrollable Errors Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {isLoading && logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 gap-3 text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500" />
              <p className="text-sm font-medium">Loading error history...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 gap-2 text-zinc-400 text-center">
              <AlertOctagon className="w-8 h-8 text-zinc-300 animate-pulse" />
              <p className="text-sm font-bold text-zinc-700">No errors logged</p>
              <p className="text-xs text-zinc-400 max-w-[200px]">
                {searchTerm ? "No records matched your search." : "No client errors have been recorded in the last 7 days."}
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <button
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`w-full text-left p-5 flex flex-col gap-2 transition-all cursor-pointer ${
                  selectedLog?.id === log.id 
                    ? 'bg-rose-50/30 border-l-4 border-rose-500' 
                    : 'hover:bg-zinc-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border border-rose-100">
                    {log.component.split('.').pop()}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {new Date(Number(log.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-xs font-bold text-zinc-900 line-clamp-2 pr-2">
                  {log.error_message}
                </p>

                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-zinc-300" />
                  {new Date(Number(log.timestamp)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </button>
            ))
          )}
        </div>
        
        {/* Auto-retention indicator */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-[10px] text-center text-zinc-400 font-bold uppercase tracking-wider">
          ⏳ Auto-retention: Pruned after 7 days
        </div>
      </div>

      {/* Right Pane: Error Detail View */}
      <div className="flex-1 flex flex-col bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm relative h-full">
        {selectedLog ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">Error Diagnostics</h4>
                <p className="text-[11px] text-zinc-500 font-medium font-mono select-all mt-0.5">{selectedLog.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedLog.session_id && (
                  <button 
                    onClick={() => onViewChatSession(selectedLog.session_id!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-elitc-gold/10 hover:bg-elitc-gold/20 text-elitc-gold rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-sm border border-elitc-gold/20"
                    title="Open chat transcript where error occurred"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Inspect Chat
                  </button>
                )}
              </div>
            </div>

            {/* Error detail area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-50/30">
              {/* Alert card */}
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 bg-white border border-rose-200 rounded-xl flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Error Message</span>
                  <h3 className="text-sm font-bold text-zinc-950 leading-relaxed select-all">
                    {selectedLog.error_message}
                  </h3>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-zinc-200/80 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Component Source</span>
                    <span className="text-xs font-bold text-zinc-800 font-mono">{selectedLog.component}</span>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/80 rounded-2xl p-4.5 flex items-center gap-3.5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">Occurred At</span>
                    <span className="text-xs font-bold text-zinc-800">{formatFullDate(selectedLog.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Session Trace */}
              <div className="bg-white border border-zinc-200/80 rounded-2xl p-4.5 flex flex-col gap-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Chat Session Reference</span>
                  {selectedLog.session_id && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      Linked
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-zinc-800 font-mono select-all">
                  {selectedLog.session_id || <span className="text-zinc-400 italic">No chat session associated (Global or Background)</span>}
                </div>
              </div>

              {/* Stack Trace */}
              <div className="flex flex-col bg-zinc-950 rounded-2xl border border-zinc-850 overflow-hidden shadow-lg h-[260px]">
                <div className="px-5 py-3 border-b border-zinc-900 bg-zinc-900/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    Stack Trace
                  </span>
                  {selectedLog.stack_trace && (
                    <button
                      onClick={() => handleCopyStack(selectedLog.stack_trace!)}
                      className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-all cursor-pointer"
                      title="Copy stack trace"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
                <div className="flex-1 p-5 overflow-auto font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre select-all">
                  {selectedLog.stack_trace ? (
                    selectedLog.stack_trace
                  ) : (
                    <span className="text-zinc-500 italic">No stack trace recorded.</span>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-zinc-400 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-2">
              <AlertOctagon className="w-8 h-8 text-zinc-300" />
            </div>
            <h4 className="text-lg font-bold text-zinc-700">No Error Selected</h4>
            <p className="text-sm text-zinc-400 max-w-sm">
              Select an error log from the list on the left to inspect its parameters, location, and stack trace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
