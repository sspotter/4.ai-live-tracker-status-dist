'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Wrench,
  Rocket,
  Rss,
  BarChart,
  Settings,
  Search,
  Filter,
  Plus,
  MessageSquare,
  CircleCheck,
  TriangleAlert,
  Zap,
  MoreHorizontal,
  Clock,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Pin,
  X,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Star,
  Download, // Added for export button
  Upload,   // Added for import button
  Menu,
  Sun,
  Moon,
  Github
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import HealthMonitor from '@/components/HealthMonitor';

const TRENDING_KEYWORDS = [
  "LLM", "OpenAI", "LangChain", "Llama", "GPT", "Agent", "RAG", 
  "Mistral", "Claude", "Gemini", "API", "GPU", "networkchuck",
  "Vector DB", "AutoGPT", "Fine-tuning"
];

export default function GithubSignalsDashboard() {
  const [mounted, setMounted] = useState(false);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasYoutubeKey, setHasYoutubeKey] = useState(true);
  const [hasRedditKey, setHasRedditKey] = useState(true);
  
  const [starredIds, setStarredIds] = useState<string[]>([]);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeKeyword, setActiveKeyword] = useState<string | null>(null);
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  
  const [showAddSource, setShowAddSource] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null);
  // sidebar should default open on desktop; compute lazily to avoid SSR issues
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 768;
  });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    trending: false,
    newTools: false,
    releases: false,
    ecosystem: false
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Filters & Sorting
  const [timeRange, setTimeRange] = useState('24h');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [signalTypeFilter, setSignalTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest_first');

  // Load config from localStorage
  useEffect(() => {
    const savedTimeRange = localStorage.getItem('radar_timeRange');
    const savedSourceFilter = localStorage.getItem('radar_sourceFilter');
    const savedSignalTypeFilter = localStorage.getItem('radar_signalTypeFilter');
    const savedSortOrder = localStorage.getItem('radar_sortOrder');
    
    if (savedTimeRange) setTimeout(() => setTimeRange(savedTimeRange), 0);
    if (savedSourceFilter) setTimeout(() => setSourceFilter(savedSourceFilter), 0);
    if (savedSignalTypeFilter) setTimeout(() => setSignalTypeFilter(savedSignalTypeFilter), 0);
    if (savedSortOrder) setTimeout(() => setSortOrder(savedSortOrder), 0);
    
    // Restore theme
    const savedTheme = localStorage.getItem('radar_theme') as 'dark' | 'light' | null;
    if (savedTheme) setTimeout(() => setTheme(savedTheme), 0);
    
    // we already initialized sidebarOpen above; only mark mounted here
    setTimeout(() => setMounted(true), 0);
  }, []);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('radar_timeRange', timeRange);
    localStorage.setItem('radar_sourceFilter', sourceFilter);
    localStorage.setItem('radar_signalTypeFilter', signalTypeFilter);
    localStorage.setItem('radar_sortOrder', sortOrder);
    localStorage.setItem('radar_theme', theme);
  }, [timeRange, sourceFilter, signalTypeFilter, sortOrder, mounted, theme]);

  // Fetch data
  useEffect(() => {
    if (!mounted) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sources and categories
        const srcRes = await fetch('/api/sources');
        const srcData = await srcRes.json();
        if (srcData.sources) setSources(srcData.sources);
        if (srcData.categories) setCategories(srcData.categories);

        // Fetch starred items
        const starRes = await fetch('/api/starred');
        const starData = await starRes.json();
        if (starData.starred) {
          setStarredIds(starData.starred.map((s: any) => s.signal_id));
        }

        // --- Fetch Live GitHub Signals ---
        const res = await fetch('/api/git');
        const data = await res.json();
        if (data.signals) {
          setSignals(data.signals);
        }
        
        // These can be hidden or removed for Github page, but left to prevent error
        setHasYoutubeKey(true);
        setHasRedditKey(true);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
      setLoading(false);
    };
    fetchData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [activeCategory, mounted]);

  const toggleStar = async (id: string) => {
    const isStarred = starredIds.includes(id);
    setStarredIds(prev => isStarred ? prev.filter(s => s !== id) : [...prev, id]);
    
    try {
      if (isStarred) {
        await fetch(`/api/starred?signal_id=${id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/starred', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signal_id: id })
        });
      }
    } catch (e) {
      console.error("Failed to toggle star", e);
      // Revert on failure
      setStarredIds(prev => isStarred ? [...prev, id] : prev.filter(s => s !== id));
    }
  };

  // Filter and Sort signals
  const displaySignals = useMemo(() => {
    const now = new Date().getTime();
    
    let filtered = signals.filter(signal => {
      // Starred Filter
      if (showOnlyStarred && !starredIds.includes(signal.id)) return false;

      // Time Range Filter
      if (signal.source !== 'YouTube') {
        const ageHours = (now - signal.timestamp) / (1000 * 60 * 60);
        if (timeRange === '24h' && ageHours > 24) return false;
        if (timeRange === '7d' && ageHours > 24 * 7) return false;
        if (timeRange === '30d' && ageHours > 24 * 30) return false;
      }
      
      // Source Filter
      if (sourceFilter === 'youtube' && signal.source !== 'YouTube') return false;
      if (sourceFilter === 'reddit' && signal.source !== 'Reddit') return false;
      
      // Signal Type Filter
      if (signalTypeFilter !== 'all' && signal.type.toLowerCase() !== signalTypeFilter) return false;
      
      // Keyword Filter
      if (activeKeyword) {
        const lowerTitle = signal.title.toLowerCase();
        const lowerDesc = signal.description.toLowerCase();
        if (!lowerTitle.includes(activeKeyword.toLowerCase()) && !lowerDesc.includes(activeKeyword.toLowerCase())) {
          return false;
        }
      }

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const lowerTitle = signal.title.toLowerCase();
        const lowerDesc = signal.description.toLowerCase();
        const lowerSource = signal.source.toLowerCase();
        const lowerChannel = (signal.channel || signal.subreddit || '').toLowerCase();
        if (!lowerTitle.includes(query) && !lowerDesc.includes(query) && !lowerSource.includes(query) && !lowerChannel.includes(query)) {
          return false;
        }
      }
      
      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const aStarred = starredIds.includes(a.id);
      const bStarred = starredIds.includes(b.id);
      
      if (sortOrder === 'starred_first') {
        if (aStarred && !bStarred) return -1;
        if (!aStarred && bStarred) return 1;
      }
      
      if (sortOrder === 'oldest_first') {
        return a.timestamp - b.timestamp;
      }
      
      if (sortOrder === 'popularity') {
        const popA = (a.likes || 0) + (a.comments || 0);
        const popB = (b.likes || 0) + (b.comments || 0);
        return popB - popA;
      }
      
      if (sortOrder === 'category') {
        const catA = a.category_name || '';
        const catB = b.category_name || '';
        if (catA !== catB) return catA.localeCompare(catB);
      }
      
      // default: newest_first
      return b.timestamp - a.timestamp;
    });

    return filtered;
  }, [signals, starredIds, timeRange, sourceFilter, signalTypeFilter, sortOrder, searchQuery, activeKeyword, showOnlyStarred]);

  const stats = useMemo(() => {
    const now = new Date().getTime();
    return {
      postsToday: signals.filter(s => (now - s.timestamp) < 24 * 60 * 60 * 1000).length,
      releases: signals.filter(s => s.type === 'RELEASE').length,
      issues: signals.filter(s => s.type === 'ISSUE').length,
      spikes: signals.filter(s => s.type === 'SPIKE').length,
    };
  }, [signals]);

  const handleExportSignals = () => {
    const dataStr = JSON.stringify(signals, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `ai_radar_signals_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSignals = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedSignals = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedSignals)) {
          // Merge imported signals with existing ones, deduplicating by ID
          setSignals(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const newSignals = importedSignals.filter(s => !existingIds.has(s.id));
            const combined = [...prev, ...newSignals];
            // Sort by timestamp descending
            return combined.sort((a, b) => b.timestamp - a.timestamp);
          });
        }
      } catch (err) {
        console.error("Failed to import signals", err);
        alert("Invalid JSON file for signals");
      }
    };
    reader.readAsText(file);
  };

  const displayKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    signals.forEach(signal => {
      TRENDING_KEYWORDS.forEach(word => {
        if (signal.title.toLowerCase().includes(word.toLowerCase())) {
          counts[word] = (counts[word] || 0) + 1;
        }
      });
    });
    
    // Get words that appeared in signals, sorted by frequency
    const trending = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([w]) => w);

    // Create a unique set of 10 keywords: [trending matches] + [other keywords from watchlist]
    const finalSet = new Set(trending);
    for (const kw of TRENDING_KEYWORDS) {
      if (finalSet.size >= 10) break;
      finalSet.add(kw);
    }

    return Array.from(finalSet);
  }, [signals]);

  const getTrend = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `+${Math.abs(hash % 50) + 10}%`;
  };

  const sourceActivity = useMemo(() => {
    const counts: Record<string, number> = {};
    const now = new Date().getTime();
    const recentSignals = signals.filter(s => (now - s.timestamp) < 7 * 24 * 60 * 60 * 1000); // Last 7 days

    recentSignals.forEach(signal => {
      const sourceName = signal.channel || signal.subreddit || signal.source;
      counts[sourceName] = (counts[sourceName] || 0) + 1;
    });

    const sortedSources = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => {
        // Calculate a mock "value" out of 100 based on the max count
        const maxCount = Math.max(...Object.values(counts));
        const value = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
        
        let status = 'Low';
        let color = 'bg-blue-500';
        if (value >= 80) { status = 'Very High'; color = 'bg-emerald-500'; }
        else if (value >= 60) { status = 'High'; color = 'bg-emerald-500'; }
        else if (value >= 40) { status = 'Moderate'; color = 'bg-amber-500'; }

        return { name, value, status, color };
      });

    return sortedSources;
  }, [signals]);

  if (!mounted) return null;

  return (
    <div data-theme={theme} className="flex h-screen theme-bg-primary theme-text-secondary font-sans overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0'} fixed md:relative z-50 md:z-auto h-full theme-bg-secondary border-r theme-border flex flex-col flex-shrink-0 transition-all duration-300 overflow-hidden`}>
        <div className="p-6 flex items-center gap-3 min-w-[256px]">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="theme-text-primary font-semibold text-lg leading-tight">AI Radar</h1>
            <p className="text-[11px] theme-text-dim">Intelligence Dashboard</p>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="ml-auto p-1.5 rounded-md theme-text-muted hover:theme-text-primary transition-colors"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto min-w-[256px]">
          <NavItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="All Signals" 
            href="/" 
          />
          <div className="pt-4 pb-2 px-3 text-xs font-semibold theme-text-dim uppercase tracking-wider">
            Categories
          </div>
          {categories.map(cat => (
            <NavItem 
              key={cat.id}
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label={cat.name} 
              active={activeCategory === cat.id}
              onClick={() => { setActiveCategory(cat.id); if (window.innerWidth < 768) setSidebarOpen(false); }}
            />
          ))}
          <div className="pt-4 pb-2 px-3 text-xs font-semibold theme-text-dim uppercase tracking-wider">
            Tools
          </div>
          <NavItem icon={<ImageIcon className="w-4 h-4" />} label="Nano Banana App" href="/image-editor" />
          <NavItem icon={<Github className="w-4 h-4" />} label="GitHub Signals" active={true} href="/git" />
          <NavItem icon={<Rss className="w-4 h-4" />} label="Signal Feed" badge={signals.length.toString()} />
          <NavItem icon={<BarChart className="w-4 h-4" />} label="Analytics" />
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>

        <div className="p-4 border-t theme-border space-y-5 min-w-[256px]">
          <div className="space-y-2 px-2">
            <div className="flex justify-between text-[10px] font-bold tracking-wider">
              <span className="theme-text-muted">STORAGE</span>
              <span className="theme-text-primary">78%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'var(--border)'}}>
              <div className="h-full bg-blue-600 w-[78%] rounded-full"></div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg text-xs font-medium border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Sync Status: Active
          </div>

          <div className="flex items-center gap-3 pt-1 px-1">
            <div className="w-9 h-9 rounded-full bg-slate-700 overflow-hidden relative">
              <Image src="https://picsum.photos/seed/alex/100/100" alt="Alex" fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="text-sm font-medium theme-text-primary leading-tight">Alex Morgan</div>
              <div className="text-[11px] theme-text-muted">Lead Researcher</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top bar with menu + theme toggle */}
        <div className="sticky top-0 z-30 flex items-center gap-2 px-4 py-2 theme-bg-primary border-b theme-border md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg theme-text-muted hover:theme-text-primary transition-colors"
            title="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
              <Rocket className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold theme-text-primary text-sm">AI Radar</span>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="ml-auto p-2 rounded-lg theme-text-muted hover:theme-text-primary transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
        {(!hasYoutubeKey || !hasRedditKey) && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-8 py-3 flex flex-col gap-1 text-amber-400 text-sm">
            {!hasYoutubeKey && (
              <div className="flex items-center gap-3">
                <TriangleAlert className="w-4 h-4" />
                <span><strong>YouTube API Key missing.</strong> Add <code className="bg-black/20 px-1 rounded">YOUTUBE_API_KEY</code> to your environment variables to see live YouTube signals.</span>
              </div>
            )}
            {!hasRedditKey && (
              <div className="flex items-center gap-3">
                <TriangleAlert className="w-4 h-4" />
                <span><strong>Reddit API Keys missing.</strong> Add <code className="bg-black/20 px-1 rounded">REDDIT_CLIENT_ID</code> and <code className="bg-black/20 px-1 rounded">REDDIT_CLIENT_SECRET</code> to your environment variables to see live Reddit signals.</span>
              </div>
            )}
          </div>
        )}
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold theme-text-primary tracking-tight">GitHub Signals</h2>
              <p className="theme-text-muted mt-1.5 text-sm">Early AI Tool Detection System.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setShowOnlyStarred(!showOnlyStarred)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${showOnlyStarred ? 'bg-blue-600/20 text-blue-400 border-blue-500/50' : 'theme-bg-secondary theme-text-secondary theme-border'}`}
                title="Show only starred signals"
              >
                <Star className={`w-4 h-4 ${showOnlyStarred ? 'fill-current' : ''}`} />
              </button>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-dim" />
                <input 
                  type="text" 
                  placeholder="Search signals, sources..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="theme-bg-secondary border theme-border text-sm rounded-lg pl-9 pr-4 py-2 theme-text-primary placeholder:opacity-50 focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-colors"
                />
              </div>
              <button 
                onClick={() => setShowAddSource(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-900/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Manage Sources</span>
              </button>
              
              <div className="flex items-center gap-2 border-l theme-border pl-3 ml-1">
                <button 
                  onClick={handleExportSignals}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border theme-bg-secondary theme-text-secondary theme-border hover:theme-text-primary"
                  title="Export current signals"
                >
                  <Download className="w-4 h-4" />
                </button>
                <label 
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border theme-bg-secondary theme-text-secondary theme-border hover:theme-text-primary cursor-pointer"
                  title="Import signals"
                >
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".json" className="hidden" onChange={handleImportSignals} title='Import signals'/>
                </label>
              </div>

              {/* Desktop theme toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border theme-bg-secondary theme-text-secondary theme-border"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {/* Desktop sidebar toggle */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border theme-bg-secondary theme-text-secondary theme-border"
                  title="Open sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>

          {/* AI Infrastructure Health */}
          <HealthMonitor />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard 
              title="Posts Today" 
              value={stats.postsToday.toString()} 
              trend="Live Data" 
              icon={<MessageSquare className="w-4 h-4 text-blue-400" />} 
              iconBg="bg-blue-500/10"
              trendUp 
              active={timeRange === '24h' && signalTypeFilter === 'all'}
              activeColor="border-blue-500"
              onClick={() => {
                setTimeRange(timeRange === '24h' && signalTypeFilter === 'all' ? 'all' : '24h');
                setSignalTypeFilter('all');
              }}
            />
            <StatCard 
              title="Releases" 
              value={stats.releases.toString()} 
              trend="Live Data" 
              icon={<CircleCheck className="w-4 h-4 text-purple-400" />} 
              iconBg="bg-purple-500/10"
              trendUp 
              active={signalTypeFilter === 'release'}
              activeColor="border-purple-500"
              onClick={() => setSignalTypeFilter(signalTypeFilter === 'release' ? 'all' : 'release')}
            />
            <StatCard 
              title="Issues Detected" 
              value={stats.issues.toString()} 
              trend="Live Data" 
              icon={<TriangleAlert className="w-4 h-4 text-red-400" />} 
              iconBg="bg-red-500/10"
              trendUp={false} 
              active={signalTypeFilter === 'issue'}
              activeColor="border-red-500"
              onClick={() => setSignalTypeFilter(signalTypeFilter === 'issue' ? 'all' : 'issue')}
            />
            <StatCard 
              title="Tool Spikes" 
              value={stats.spikes.toString()} 
              trend="Live Data" 
              icon={<Zap className="w-4 h-4 text-amber-400" />} 
              iconBg="bg-amber-500/10"
              trendUp 
              active={signalTypeFilter === 'spike'}
              activeColor="border-amber-500"
              onClick={() => setSignalTypeFilter(signalTypeFilter === 'spike' ? 'all' : 'spike')}
            />
            <StatCard 
              title="Active Sources" 
              value={sources.length.toString()} 
              trend="Tracked" 
              icon={<MessageSquare className="w-4 h-4 text-teal-400" />} 
              iconBg="bg-teal-500/10"
              trendUp 
              activeColor="border-emerald-500"
              onClick={() => setShowAddSource(true)}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Signals Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 theme-bg-secondary p-3 rounded-xl border theme-border">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-sm font-semibold theme-text-primary flex items-center gap-2">
                    GitHub Signals
                    {loading && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
                  </h3>
                  <div className="hidden sm:block h-4 w-px" style={{backgroundColor: 'var(--border)'}}></div>
                  <select 
                   title='Time Range'
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="theme-select text-xs theme-text-muted focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
                  <select 
                   title='Signal Type'
                    value={signalTypeFilter} 
                    onChange={(e) => setSignalTypeFilter(e.target.value)}
                    className="theme-select text-xs theme-text-muted focus:outline-none cursor-pointer transition-colors"
                  >
                    <option value="all">All Types</option>
                    <option value="trending">Trending</option>
                    <option value="new_tool">New Tool</option>
                    <option value="release">Releases</option>
                    <option value="ecosystem">Ecosystem</option>
                  </select>
                </div>
                <select 
                 title='sort order'
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="theme-bg-primary border theme-border text-xs rounded-md px-2 py-1 theme-text-secondary focus:outline-none focus:border-blue-500 self-start sm:self-auto"
                >
                  <option value="newest_first">Newest First</option>
                  <option value="oldest_first">Oldest First</option>
                  <option value="starred_first">Starred First</option>
                  <option value="popularity">Popularity</option>
                  <option value="category">Category</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-8">
                {/* Trending Repos */}
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSection('trending')}
                  >
                    <h4 className="text-sm font-semibold theme-text-muted uppercase tracking-wider flex items-center gap-2 transition-colors">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Trending Repos
                    </h4>
                    <ChevronRight className={`w-4 h-4 theme-text-dim transition-transform ${!collapsedSections.trending ? 'rotate-90' : ''}`} />
                  </div>
                  {!collapsedSections.trending && (
                    displaySignals.filter(s => s.type === 'TRENDING').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {displaySignals.filter(s => s.type === 'TRENDING').slice(0, 30).map((signal) => (
                          <SignalCard 
                            key={signal.id} 
                            signal={signal} 
                            isStarred={starredIds.includes(signal.id)}
                            onStar={toggleStar}
                            onSelect={setSelectedSignal}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center theme-text-dim theme-bg-secondary rounded-xl border theme-border text-sm">
                        {loading ? "Loading signals..." : "No trending repos found."}
                      </div>
                    )
                  )}
                </div>

                {/* New AI Tools */}
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSection('newTools')}
                  >
                    <h4 className="text-sm font-semibold theme-text-muted uppercase tracking-wider flex items-center gap-2 transition-colors">
                      <Rocket className="w-4 h-4 text-blue-400" />
                      New AI Tools
                    </h4>
                    <ChevronRight className={`w-4 h-4 theme-text-dim transition-transform ${!collapsedSections.newTools ? 'rotate-90' : ''}`} />
                  </div>
                  {!collapsedSections.newTools && (
                    displaySignals.filter(s => s.type === 'NEW_TOOL').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {displaySignals.filter(s => s.type === 'NEW_TOOL').slice(0, 20).map((signal) => (
                          <SignalCard 
                            key={signal.id} 
                            signal={signal} 
                            isStarred={starredIds.includes(signal.id)}
                            onStar={toggleStar}
                            onSelect={setSelectedSignal}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center theme-text-dim theme-bg-secondary rounded-xl border theme-border text-sm">
                        {loading ? "Loading tools..." : "No new AI tools found."}
                      </div>
                    )
                  )}
                </div>

                {/* Releases */}
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSection('releases')}
                  >
                    <h4 className="text-sm font-semibold theme-text-muted uppercase tracking-wider flex items-center gap-2 transition-colors">
                      <CircleCheck className="w-4 h-4 text-purple-400" />
                      Releases
                    </h4>
                    <ChevronRight className={`w-4 h-4 theme-text-dim transition-transform ${!collapsedSections.releases ? 'rotate-90' : ''}`} />
                  </div>
                  {!collapsedSections.releases && (
                    displaySignals.filter(s => s.type === 'RELEASE').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {displaySignals.filter(s => s.type === 'RELEASE').slice(0, 20).map((signal) => (
                          <SignalCard 
                            key={signal.id} 
                            signal={signal} 
                            isStarred={starredIds.includes(signal.id)}
                            onStar={toggleStar}
                            onSelect={setSelectedSignal}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center theme-text-dim theme-bg-secondary rounded-xl border theme-border text-sm">
                        {loading ? "Loading releases..." : "No new releases found."}
                      </div>
                    )
                  )}
                </div>

                {/* Ecosystem Tools */}
                <div className="space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSection('ecosystem')}
                  >
                    <h4 className="text-sm font-semibold theme-text-muted uppercase tracking-wider flex items-center gap-2 transition-colors">
                      <Wrench className="w-4 h-4 text-teal-400" />
                      Ecosystem Tools
                    </h4>
                    <ChevronRight className={`w-4 h-4 theme-text-dim transition-transform ${!collapsedSections.ecosystem ? 'rotate-90' : ''}`} />
                  </div>
                  {!collapsedSections.ecosystem && (
                    displaySignals.filter(s => s.type === 'ECOSYSTEM').length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6">
                        {displaySignals.filter(s => s.type === 'ECOSYSTEM').slice(0, 20).map((signal) => (
                          <SignalCard 
                            key={signal.id} 
                            signal={signal} 
                            isStarred={starredIds.includes(signal.id)}
                            onStar={toggleStar}
                            onSelect={setSelectedSignal}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center theme-text-dim theme-bg-secondary rounded-xl border theme-border text-sm">
                        {loading ? "Loading ecosystem tools..." : "No ecosystem tools found."}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Trending Keywords */}
              <div className="theme-bg-secondary border theme-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold theme-text-primary">Trending Keywords</h3>
                  {activeKeyword ? (
                    <button 
                      onClick={() => setActiveKeyword('')}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Clear Filter
                    </button>
                  ) : (
                    <button className="text-slate-500 hover:text-slate-300 transition-colors" title='More options'><MoreHorizontal className="w-5 h-5" /></button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {displayKeywords.map((kw, i) => (
                    <KeywordPill 
                      key={kw} 
                      label={kw} 
                      trend={i < 3 ? getTrend(kw) : undefined} 
                      active={activeKeyword === kw}
                      onClick={() => setActiveKeyword(activeKeyword === kw ? '' : kw)}
                    />
                  ))}
                </div>
              </div>

              {/* Source Activity */}
              <div className="theme-bg-secondary border theme-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold theme-text-primary">Source Activity</h3>
                  <span className="text-[11px] font-medium px-2 py-1 rounded theme-text-secondary" style={{backgroundColor: 'var(--border)'}}>Live</span>
                </div>
                <div className="space-y-5">
                  {sourceActivity.length > 0 ? (
                    sourceActivity.map((source, i) => (
                      <ActivityBar 
                        key={i} 
                        label={source.name} 
                        value={source.value} 
                        status={source.status} 
                        color={source.color} 
                      />
                    ))
                  ) : (
                    <div className="text-sm text-slate-500 text-center py-4">No recent activity</div>
                  )}
                </div>
              </div>

              {/* Geographic Interest */}
              <div>
                <h3 className="text-xs font-semibold theme-text-muted mb-3 uppercase tracking-wider">Geographic Interest (Top 3)</h3>
                <div className="grid grid-cols-3 gap-3">
                  <GeoCard city="Paris" image="https://picsum.photos/seed/paris/200/300" />
                  <GeoCard city="NYC" image="https://picsum.photos/seed/nyc/200/300" />
                  <GeoCard city="Tokyo" image="https://picsum.photos/seed/tokyo/200/300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Source Modal */}
      <AddSourceModal 
        isOpen={showAddSource} 
        onClose={() => setShowAddSource(false)}
        sources={sources}
        setSources={setSources}
        categories={categories}
      />

      {/* Signal Detail Modal */}
      <SignalModal 
        signal={selectedSignal} 
        onClose={() => setSelectedSignal(null)} 
      />
    </div>
  );
}

// Components

function AddSourceModal({ isOpen, onClose, sources, setSources, categories }: any) {
  const [sourceType, setSourceType] = useState('subreddit');
  const [inputValue, setInputValue] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');

  // Set default category
  useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!inputValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    
    const val = inputValue.trim().replace(/^r\//, '').replace(/^u\//, '').replace(/^@/, '');
    
    try {
      const res = await fetch('/api/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sourceType,
          name: val,
          category_id: categoryId || null
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.source) {
          setSources([data.source, ...sources]);
        }
        setInputValue('');
      }
    } catch (e) {
      console.error("Failed to add source", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSource = async (id: string) => {
    try {
      const res = await fetch(`/api/sources?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSources(sources.filter((s: any) => s.id !== id));
      }
    } catch (e) {
      console.error("Failed to remove source", e);
    }
  };

  const filteredSources = sources.filter((s: any) => 
    s.name.toLowerCase().includes(sourceSearchQuery.toLowerCase()) ||
    (s.category_name && s.category_name.toLowerCase().includes(sourceSearchQuery.toLowerCase()))
  );

  const subreddits = filteredSources.filter((s: any) => s.type === 'subreddit');
  const redditUsers = filteredSources.filter((s: any) => s.type === 'redditUser');
  const youtubeQueries = filteredSources.filter((s: any) => s.type === 'youtube');
  const youtubeChannels = filteredSources.filter((s: any) => s.type === 'youtubeChannel');

  const handleExport = () => {
    const dataStr = JSON.stringify(sources, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'ai_radar_sources.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importedSources = JSON.parse(event.target?.result as string);
        const res = await fetch('/api/sources/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sources: importedSources })
        });
        if (res.ok) {
          // Refresh sources
          const srcRes = await fetch('/api/sources');
          const srcData = await srcRes.json();
          if (srcData.sources) setSources(srcData.sources);
        }
      } catch (err) {
        console.error("Failed to import", err);
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4">
      <div className="theme-bg-secondary border theme-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between p-4 border-b theme-border">
          <h3 className="text-lg font-semibold theme-text-primary">Manage Sources</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#2A2E39] hover:bg-slate-700 px-2.5 py-1.5 rounded transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#2A2E39] hover:bg-slate-700 px-2.5 py-1.5 rounded transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors ml-2"  title='close'><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search sources..." 
              value={sourceSearchQuery}
              onChange={(e) => setSourceSearchQuery(e.target.value)}
              className="w-full theme-bg-primary border theme-border text-sm rounded-lg pl-9 pr-4 py-2 theme-text-primary placeholder:opacity-50 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select 
              title='select element'
                value={sourceType} 
                onChange={(e) => setSourceType(e.target.value)}
                className="theme-bg-primary border theme-border text-sm rounded-lg px-3 py-2 theme-text-primary focus:outline-none focus:border-blue-500 w-1/3"
              >
                <option value="subreddit">Subreddit (r/)</option>
                <option value="redditUser">Reddit User (u/)</option>
                <option value="youtube">YouTube Topic</option>
                <option value="youtubeChannel">YouTube Channel</option>
              </select>
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder={sourceType === 'subreddit' ? 'e.g. MachineLearning' : sourceType === 'redditUser' ? 'e.g. samaltman' : sourceType === 'youtubeChannel' ? 'e.g. @Fireship or URL' : 'e.g. Marques Brownlee'}
                className="flex-1 theme-bg-primary border theme-border text-sm rounded-lg px-3 py-2 theme-text-primary placeholder:opacity-50 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <select 
               title='select category for source'
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="flex-1 theme-bg-primary border theme-border text-sm rounded-lg px-3 py-2 theme-text-primary focus:outline-none focus:border-blue-500"
              >
                <option value="">No Category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <button 
                onClick={handleAdd} 
                disabled={isSubmitting || !inputValue.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-24 flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-4 max-h-64 overflow-y-auto pr-2">
            {subreddits.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subreddits</h4>
                <div className="space-y-2">
                  {subreddits.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between theme-bg-primary px-3 py-2 rounded-lg border theme-border">
                      <div className="flex items-center gap-2">
                        <span className="text-sm theme-text-secondary">r/{s.name}</span>
                        {s.category_name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2E39] text-slate-400">{s.category_name}</span>}
                      </div>
                      <button onClick={() => removeSource(s.id)} className="text-red-400 hover:text-red-300" title='remove source'>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {redditUsers.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Reddit Users</h4>
                <div className="space-y-2">
                  {redditUsers.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between bg-[#111318] px-3 py-2 rounded-lg border border-[#2A2E39]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">u/{s.name}</span>
                        {s.category_name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2E39] text-slate-400">{s.category_name}</span>}
                      </div>
                      <button onClick={() => removeSource(s.id)} className="text-red-400 hover:text-red-300" title='remove source'><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {youtubeQueries.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">YouTube Topics</h4>
                <div className="space-y-2">
                  {youtubeQueries.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between bg-[#111318] px-3 py-2 rounded-lg border border-[#2A2E39]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{s.name}</span>
                        {s.category_name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2E39] text-slate-400">{s.category_name}</span>}
                      </div>
                      <button onClick={() => removeSource(s.id)} className="text-red-400 hover:text-red-300" title='remove source'><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {youtubeChannels.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">YouTube Channels</h4>
                <div className="space-y-2">
                  {youtubeChannels.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between bg-[#111318] px-3 py-2 rounded-lg border border-[#2A2E39]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-300">{s.name}</span>
                        {s.category_name && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2A2E39] text-slate-400">{s.category_name}</span>}
                      </div>
                      <button onClick={() => removeSource(s.id)} className="text-red-400 hover:text-red-300" title='remove source'><Trash2 className="w-4 h-4"  /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalModal({ signal, onClose }: { signal: any, onClose: () => void }) {
  if (!signal) return null;

  const colorMap: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  return (
    <div className="fixed inset-0 theme-overlay backdrop-blur-sm flex items-center justify-center z-50 transition-opacity p-4" onClick={onClose}>
      <div 
        className="theme-bg-secondary border theme-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b theme-border shrink-0">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colorMap[signal.color]}`}>
              {signal.type}
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(signal.timestamp).toLocaleString()}
            </span>
          </div>
          <button  onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-[#2A2E39]/50 hover:bg-[#2A2E39] p-1.5 rounded-md" title='onclose'>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <h2 className="text-xl font-semibold theme-text-primary mb-4 leading-snug">{signal.title}</h2>
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b theme-border">
            <div className="flex items-center gap-2 theme-bg-primary px-3 py-1.5 rounded-lg border theme-border">
              {signal.source === 'Reddit' ? <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#FF4500]"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.508 1.183-.849 2.863-1.418 4.692-1.493l.815-3.805a.39.39 0 0 1 .464-.309l2.928.617a1.246 1.246 0 0 1 1.122-.02zm-10.086 7.61a1.082 1.082 0 0 0-.013 2.165 1.082 1.082 0 0 0 .013-2.165zm10.16 0a1.082 1.082 0 0 0-.013 2.165 1.082 1.082 0 0 0 .013-2.165zm-5.08 3.23c-1.63 0-3.08.59-3.46.91a.41.41 0 0 0 .54.63c.27-.23 1.56-.76 2.92-.76 1.36 0 2.65.53 2.92.76a.41.41 0 0 0 .54-.63c-.38-.32-1.83-.91-3.46-.91z"/></svg> : 
               signal.source === 'YouTube' ? <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-red-500"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> :
               <LayoutDashboard className="w-4 h-4 text-slate-400" />}
              <span className="text-sm font-medium theme-text-secondary">{signal.channel || signal.subreddit || signal.source}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
              {signal.likes !== undefined && (
                <div className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
                  {signal.likes}
                </div>
              )}
              {signal.comments !== undefined && (
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  {signal.comments}
                </div>
              )}
            </div>
          </div>

          {signal.thumbnail && (
            <div className="mb-6 rounded-xl overflow-hidden border theme-border relative aspect-video bg-black/50">
              <Image src={signal.thumbnail} alt={signal.title} fill className="object-cover" referrerPolicy="no-referrer" />
            </div>
          )}

          <div className="prose max-w-none theme-text-secondary text-sm whitespace-pre-wrap leading-relaxed">
            {signal.description}
          </div>
        </div>
        
        <div className="p-5 border-t theme-border theme-bg-tertiary shrink-0 flex justify-end">
          <a 
            href={signal.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-900/20"
          >
            Open Original Source
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

function SignalCard({ signal, isStarred, onStar, onSelect }: any) {
  const colorMap: Record<string, string> = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };
  
  const borderMap: Record<string, string> = {
    purple: 'border-l-purple-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
  };

  return (
    <div 
      className={`block theme-card border border-l-4 ${borderMap[signal.color]} rounded-xl p-5 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 group relative flex flex-col cursor-pointer`}
      onClick={() => onSelect?.(signal)}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colorMap[signal.color]}`}>
            {signal.type}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {signal.time}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onStar(signal.id); }} 
            className={`p-1.5 rounded-md transition-colors ${isStarred ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:bg-[#2A2E39] hover:text-slate-300'}`}
            title={isStarred ? "Unstar" : "Star"}
          >
            <Star className={`w-4 h-4 ${isStarred ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Thumbnail Preview (Always visible if available) */}
      {signal.thumbnail && (
        <div className="mb-4 rounded-lg overflow-hidden border theme-border relative w-full aspect-video">
          <Image src={signal.thumbnail} alt="Thumbnail" fill className="object-cover" referrerPolicy="no-referrer" />
        </div>
      )}

      {/* Main Section */}
      <div className="flex-1">
        <h4 className="text-lg font-semibold theme-text-primary mb-2 group-hover:text-blue-400 transition-colors">{signal.title}</h4>
        <p className="text-sm theme-text-muted leading-relaxed mb-4 line-clamp-2">{signal.description}</p>
      </div>
      
      {/* Footer Row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-1.5 bg-[#2A2E39]/50 px-2 py-1 rounded">
            {signal.source === 'Reddit' ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-[#FF4500]"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.508 1.183-.849 2.863-1.418 4.692-1.493l.815-3.805a.39.39 0 0 1 .464-.309l2.928.617a1.246 1.246 0 0 1 1.122-.02zm-10.086 7.61a1.082 1.082 0 0 0-.013 2.165 1.082 1.082 0 0 0 .013-2.165zm10.16 0a1.082 1.082 0 0 0-.013 2.165 1.082 1.082 0 0 0 .013-2.165zm-5.08 3.23c-1.63 0-3.08.59-3.46.91a.41.41 0 0 0 .54.63c.27-.23 1.56-.76 2.92-.76 1.36 0 2.65.53 2.92.76a.41.41 0 0 0 .54-.63c-.38-.32-1.83-.91-3.46-.91z"/></svg> : 
             signal.source === 'YouTube' ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-red-500"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> : 
             signal.source === 'GitHub' ? <Github className="w-3.5 h-3.5 text-slate-400" /> :
             <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />}
            <span className="theme-text-secondary">{signal.channel || signal.subreddit || signal.source}</span>
          </div>
          
          {signal.likes !== undefined && (
            <div className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>
              {signal.likes}
            </div>
          )}
          {signal.comments !== undefined && (
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {signal.comments}
            </div>
          )}
          {signal.severity && (
            <div className="flex items-center gap-1 text-red-400">
              <TriangleAlert className="w-3.5 h-3.5" />
              {signal.severity}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, badge, onClick, href }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string, onClick?: () => void, href?: string }) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {badge && (
        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </>
  );

  const className = `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'theme-text-muted hover:theme-text-primary'}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <a href="#" onClick={(e) => { e.preventDefault(); onClick?.(); }} className={className}>
      {content}
    </a>
  );
}

function StatCard({ title, value, trend, icon, iconBg, trendUp, active, activeColor = 'border-blue-500', onClick }: { title: string, value: string, trend: string, icon: React.ReactNode, iconBg: string, trendUp: boolean, active?: boolean, activeColor?: string, onClick?: () => void }) {
  const activeClass = active ? `${activeColor} shadow-sm ${activeColor.replace('border-', 'shadow-')}/20` : 'theme-border';
  return (
    <div 
      onClick={onClick}
      className={`theme-bg-secondary border ${activeClass} rounded-xl p-4 flex flex-col justify-between h-[110px] cursor-pointer transition-all`}
    >
      <div className="flex justify-between items-start">
        <span className="text-sm theme-text-muted font-medium">{title}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold theme-text-primary mb-1">{value}</div>
        <div className={`text-xs font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
          <svg className={`w-3 h-3 ${trendUp ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {trend}
        </div>
      </div>
    </div>
  );
}

function KeywordPill({ label, trend, active, onClick }: { label: string, trend?: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs font-medium transition-colors cursor-pointer ${
        active 
          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
          : 'bg-[#2A2E39]/50 border-[#2A2E39] text-slate-300 hover:bg-[#2A2E39]'
      }`}
    >
      {label}
      {trend && <span className={active ? "text-blue-300 text-[10px]" : "text-blue-400 text-[10px]"}>{trend}</span>}
    </div>
  );
}

function ActivityBar({ label, value, status, color }: { label: string, value: number, status: string, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-sm text-slate-300 font-medium">{label}</span>
        <span className={`text-xs font-semibold ${status === 'Very High' || status === 'High' ? 'text-emerald-500' : 'text-amber-500'}`}>{status}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{backgroundColor: 'var(--border)'}}>
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}

function GeoCard({ city, image }: { city: string, image: string }) {
  return (
    <div className="relative h-24 rounded-lg overflow-hidden group cursor-pointer">
      <Image src={image} alt={city} fill className="object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <span className="text-xs font-semibold text-white tracking-wide">{city}</span>
      </div>
    </div>
  );
}
