'use client';

import { useState, useEffect } from 'react';
import { Star, LayoutDashboard, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function StarredPage() {
  const [starredItems, setStarredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarred = async () => {
      try {
        const res = await fetch('/api/starred');
        const data = await res.json();
        if (data.starred) {
          setStarredItems(data.starred);
        }
      } catch (e) {
        console.error("Failed to fetch starred items", e);
      }
      setLoading(false);
    };
    fetchStarred();
  }, []);

  const handleUnstar = async (signalId: string) => {
    try {
      await fetch(`/api/starred?signal_id=${signalId}`, { method: 'DELETE' });
      setStarredItems(prev => prev.filter(item => item.id !== signalId));
    } catch (e) {
      console.error("Failed to unstar item", e);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0C10] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2A2E39]/50 bg-[#0A0C10]/95 backdrop-blur-xl flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-3 text-indigo-400 font-semibold tracking-wide text-lg">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Star className="w-4 h-4" />
            </div>
            AI Radar
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#2A2E39]/50 transition-colors text-sm font-medium">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/starred" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 transition-colors text-sm font-medium border border-indigo-500/20">
            <Star className="w-4 h-4" />
            Starred
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
          <header className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Starred Intelligence</h1>
              <p className="text-slate-400 text-sm">Your personal library of saved signals.</p>
            </div>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : starredItems.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Star className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No starred items yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {starredItems.map((item) => {
                const metrics = item.engagement_metrics ? JSON.parse(item.engagement_metrics) : {};
                return (
                  <div key={item.id} className="bg-[#111318] border border-[#2A2E39] rounded-xl p-5 relative group flex flex-col h-full">
                    <button 
                      onClick={() => handleUnstar(item.id)}
                      className="absolute top-4 right-4 text-yellow-500 hover:text-slate-400 transition-colors"
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                        {item.type}
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-slate-200 leading-snug mb-2 line-clamp-2">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                        {item.title}
                      </a>
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#2A2E39]/50">
                      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                        {metrics.likes !== undefined && (
                          <div className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                            {metrics.likes}
                          </div>
                        )}
                        {metrics.comments !== undefined && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3.5 h-3.5" />
                            {metrics.comments}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
