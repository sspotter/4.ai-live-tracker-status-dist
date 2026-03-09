'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface HealthStatus {
  id: string;
  name: string;
  status: string;
  indicator: 'operational' | 'degraded' | 'down' | 'unknown';
  url: string;
}

export default function HealthMonitor() {
  const [statuses, setStatuses] = useState<HealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchHealth = async (force = false) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/health${force ? '?force=true' : ''}`);
      if (res.ok) {
        const data = await res.json();
        setStatuses(data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error('Failed to fetch health status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchHealth();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getIndicatorColor = (indicator: string) => {
    switch (indicator) {
      case 'operational': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'degraded': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'down': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getIndicatorEmoji = (indicator: string) => {
    switch (indicator) {
      case 'operational': return '🟢';
      case 'degraded': return '🟡';
      case 'down': return '🔴';
      default: return '⚪';
    }
  };

  if (statuses.length === 0 && !loading) return null;

  return (
    <div className="theme-bg-secondary border theme-border rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold theme-text-primary tracking-wide uppercase">AI Infrastructure Health</h3>
          {loading && <RefreshCw className="w-3.5 h-3.5 theme-text-muted animate-spin" />}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs theme-text-muted">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button 
            onClick={() => fetchHealth(true)}
            disabled={loading}
            className="theme-text-muted hover:theme-text-primary transition-colors disabled:opacity-50"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statuses.length > 0 ? statuses.map((provider) => (
          <a 
            key={provider.id}
            href={provider.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col gap-2 p-4 rounded-lg border transition-colors hover:bg-opacity-80 ${getIndicatorColor(provider.indicator)}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm theme-text-primary">{provider.name}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-50" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{getIndicatorEmoji(provider.indicator)}</span>
              <span className="text-xs font-medium">{provider.status}</span>
            </div>
          </a>
        )) : (
          // Skeleton loading state
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 p-4 rounded-lg border theme-border theme-bg-primary animate-pulse">
              <div className="h-4 rounded w-1/2" style={{backgroundColor: 'var(--border)'}}></div>
              <div className="h-3 rounded w-3/4 mt-1" style={{backgroundColor: 'var(--border)'}}></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
