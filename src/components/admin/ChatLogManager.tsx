import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/db';
import { 
  Search, 
  MessageSquare, 
  Clock, 
  RefreshCw, 
  User, 
  Bot,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Session {
  session_id: string;
  count: number;
  last_active: number;
  last_message: string;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatLogManagerProps {
  initialSessionId?: string | null;
  onSelectSession?: (sessionId: string | null) => void;
}

export function ChatLogManager({ initialSessionId, onSelectSession }: ChatLogManagerProps = {}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);

  // --- Fetch Sessions ---
  const fetchSessions = async () => {
    setIsLoadingList(true);
    try {
      const data = await dbService.getChatSessions();
      setSessions(data);
    } catch (e) {
      console.error("Failed to load chat sessions:", e);
    } finally {
      setIsLoadingList(false);
    }
  };

  // --- Fetch Messages for Session ---
  const fetchSessionMessages = async (sessionId: string) => {
    setIsLoadingTranscript(true);
    try {
      const data = await dbService.getChatSessionMessages(sessionId);
      setMessages(data);
      setSelectedSessionId(sessionId);
      if (onSelectSession) {
        onSelectSession(sessionId);
      }
    } catch (e) {
      console.error("Failed to load chat session messages:", e);
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Sync with initialSessionId if it's set by parent
  useEffect(() => {
    if (initialSessionId && initialSessionId !== selectedSessionId) {
      fetchSessionMessages(initialSessionId);
    }
  }, [initialSessionId]);

  // --- Filter Sessions ---
  const filteredSessions = sessions.filter(s => 
    s.session_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.last_message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper: Format relative or detailed date string
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-210px)] min-h-[500px]">
      {/* Left Pane: Sessions List */}
      <div className="w-full lg:w-96 flex flex-col bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-zinc-100 flex flex-col gap-4 bg-zinc-50/50">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-elitc-gold" />
              Chat Sessions
            </h3>
            <button 
              onClick={fetchSessions} 
              disabled={isLoadingList}
              className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors disabled:opacity-50 cursor-pointer"
              title="Refresh session list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search session ID or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-elitc-gold/20 outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Sessions Scrollable Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {isLoadingList ? (
            <div className="flex flex-col items-center justify-center p-8 gap-3 text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin text-elitc-gold" />
              <p className="text-sm font-medium">Loading session history...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 gap-2 text-zinc-400 text-center">
              <AlertCircle className="w-8 h-8 text-zinc-300" />
              <p className="text-sm font-bold text-zinc-700">No sessions found</p>
              <p className="text-xs text-zinc-400 max-w-[200px]">No active conversations in the last 7 days matched your search.</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <button
                key={session.session_id}
                onClick={() => fetchSessionMessages(session.session_id)}
                className={`w-full text-left p-5 flex flex-col gap-2 transition-all cursor-pointer ${
                  selectedSessionId === session.session_id 
                    ? 'bg-elitc-gold/5 border-l-4 border-elitc-gold' 
                    : 'hover:bg-zinc-50 border-l-4 border-transparent'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-bold text-zinc-400 truncate max-w-[170px]" title={session.session_id}>
                    {session.session_id}
                  </span>
                  <span className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                    {session.count} messages
                  </span>
                </div>
                
                <p className="text-xs font-medium text-zinc-800 line-clamp-2 pr-2">
                  {session.last_message || 'Empty conversation'}
                </p>

                <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-zinc-300" />
                  {new Date(session.last_active).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {new Date(session.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </button>
            ))
          )}
        </div>
        
        {/* Retention policy note at footer */}
        <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-[10px] text-center text-zinc-400 font-bold uppercase tracking-wider">
          ⏳ Auto-retention: Pruned after 7 days
        </div>
      </div>

      {/* Right Pane: Transcript View */}
      <div className="flex-1 flex flex-col bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm relative h-full">
        {selectedSessionId ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">Transcript for Session</h4>
                <p className="text-[11px] text-zinc-500 font-medium font-mono select-all mt-0.5">{selectedSessionId}</p>
              </div>
              <button 
                onClick={() => fetchSessionMessages(selectedSessionId)}
                className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors cursor-pointer"
                title="Reload transcript"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingTranscript ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Transcript scroll area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-zinc-50/30">
              {isLoadingTranscript ? (
                <div className="absolute inset-0 bg-white/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-elitc-gold" />
                  <p className="text-sm font-semibold text-zinc-600">Loading conversation history...</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                        isUser ? 'bg-zinc-950 border border-zinc-800' : 'bg-white border border-zinc-200'
                      }`}>
                        {isUser ? <User className="w-4 h-4 text-zinc-400" /> : <Bot className="w-4 h-4 text-elitc-gold" />}
                      </div>

                      {/* Content */}
                      <div className="max-w-[75%] space-y-1">
                        <div className={`px-4.5 py-3 rounded-[20px] text-[13.5px] leading-relaxed shadow-sm ${
                          isUser 
                            ? 'bg-zinc-950 text-zinc-100 rounded-tr-none border border-zinc-800' 
                            : 'bg-white border border-zinc-200/80 text-zinc-800 rounded-tl-none font-medium'
                        }`}>
                          <div className="whitespace-pre-wrap prose prose-sm max-w-none prose-zinc prose-p:my-0 prose-a:text-elitc-gold prose-a:underline text-left">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                        
                        {/* Time */}
                        <div className={`text-[9px] font-bold text-zinc-400 flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <Clock className="w-2.5 h-2.5 text-zinc-300" />
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-zinc-400 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-2">
              <MessageSquare className="w-8 h-8 text-zinc-300" />
            </div>
            <h4 className="text-lg font-bold text-zinc-700">No Transcript Selected</h4>
            <p className="text-sm text-zinc-400 max-w-sm">
              Select a chat session from the list on the left to review the conversation log.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
