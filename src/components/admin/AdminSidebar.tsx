import React from 'react';
import { Database, Settings, Zap, LogOut } from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'courses' | 'config' | 'system';
  setActiveTab: (tab: 'courses' | 'config' | 'system') => void;
  handleLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, handleLogout }) => {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-zinc-200 hidden lg:flex flex-col z-10">
      <div className="p-6 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-elitc-gold rounded-xl flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900">ELITC</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => setActiveTab('courses')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'courses' ? 'bg-elitc-gold/10 text-elitc-gold font-semibold shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
        >
          <Database className="w-5 h-5" />
          Course Catalog
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-elitc-gold/10 text-elitc-gold font-semibold shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
        >
          <Settings className="w-5 h-5" />
          Bot Configuration
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'system' ? 'bg-elitc-gold/10 text-elitc-gold font-semibold shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
        >
          <Zap className="w-5 h-5" />
          System Tools
        </button>
      </nav>

      <div className="p-4 border-t border-zinc-100">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-[10px] text-white font-bold">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-zinc-900 truncate">Administrator</p>
            <p className="text-[10px] text-zinc-500 truncate">admin@elitc.assistant</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-zinc-500 hover:text-zinc-900 text-xs font-medium hover:bg-zinc-50 rounded-lg transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
