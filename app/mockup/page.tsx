import React from 'react';
import {
  LayoutDashboard,
  Wrench,
  Rocket,
  Rss,
  BarChart3,
  Settings,
  Search,
  Filter,
  Plus,
  MessageSquare,
  CheckCircle2,
  TriangleAlert,
  Zap,
  MoreHorizontal,
  Clock,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#111318] text-slate-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1D24] border-r border-[#2A2E39] flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg leading-tight">AI Radar</h1>
            <p className="text-[11px] text-slate-400">Intelligence Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" active />
          <NavItem icon={<Wrench className="w-4 h-4" />} label="Tool Tracker" />
          <NavItem icon={<Rocket className="w-4 h-4" />} label="Release Center" />
          <NavItem icon={<Rss className="w-4 h-4" />} label="Signal Feed" badge="12" />
          <NavItem icon={<BarChart3 className="w-4 h-4" />} label="Analytics" />
          <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>

        <div className="p-4 border-t border-[#2A2E39] space-y-5">
          <div className="space-y-2 px-2">
            <div className="flex justify-between text-[10px] font-bold tracking-wider">
              <span className="text-slate-400">STORAGE</span>
              <span className="text-white">78%</span>
            </div>
            <div className="h-1.5 bg-[#2A2E39] rounded-full overflow-hidden">
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
              <div className="text-sm font-medium text-white leading-tight">Alex Morgan</div>
              <div className="text-[11px] text-slate-400">Lead Researcher</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
          {/* Header */}
          <header className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-white tracking-tight">Intelligence Overview</h2>
              <p className="text-slate-400 mt-1.5 text-sm">Real-time tracking of AI tool releases and developer signals.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search signals..." 
                  className="bg-[#1A1D24] border border-[#2A2E39] text-sm rounded-lg pl-9 pr-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500 w-64 transition-colors"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1A1D24] border border-[#2A2E39] rounded-lg text-sm font-medium text-slate-300 hover:bg-[#2A2E39] transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-900/20">
                <Plus className="w-4 h-4" />
                Add Source
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-4">
            <StatCard 
              title="Posts Today" 
              value="1,248" 
              trend="+12% vs yesterday" 
              icon={<MessageSquare className="w-4 h-4 text-blue-400" />} 
              iconBg="bg-blue-500/10"
              trendUp 
            />
            <StatCard 
              title="Releases" 
              value="14" 
              trend="+3 new tools" 
              icon={<CheckCircle2 className="w-4 h-4 text-purple-400" />} 
              iconBg="bg-purple-500/10"
              trendUp 
            />
            <StatCard 
              title="Issues Detected" 
              value="32" 
              trend="+1% increase" 
              icon={<TriangleAlert className="w-4 h-4 text-red-400" />} 
              iconBg="bg-red-500/10"
              trendUp={false} 
            />
            <StatCard 
              title="Tool Spikes" 
              value="8" 
              trend="+15% engagement" 
              icon={<Zap className="w-4 h-4 text-amber-400" />} 
              iconBg="bg-amber-500/10"
              trendUp 
            />
            <StatCard 
              title="Active Subreddits" 
              value="45" 
              trend="+2 new tracked" 
              icon={<MessageSquare className="w-4 h-4 text-teal-400" />} 
              iconBg="bg-teal-500/10"
              trendUp 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Signals Column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white">Today&apos;s Signals</h3>
                <button className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">View all feed</button>
              </div>
              
              <div className="space-y-4">
                <SignalCard 
                  type="RELEASE" 
                  time="2h ago" 
                  title="LangChain v0.1.0 Official Release" 
                  description="Major stability improvements and new architecture for chain composition. The community is highlighting the improved debugging tools and reduced latency in..."
                  source="r/LangChain"
                  likes={452}
                  comments={89}
                  color="purple"
                />
                <SignalCard 
                  type="SPIKE" 
                  time="4h ago" 
                  title='Sudden Interest in "Local Llama 3"' 
                  description='Significant uptick in discussions regarding running Llama 3 locally on consumer hardware. Keywords "quantization" and "Mac Studio" are trending alongside.'
                  source="Twitter / X"
                  impressions="12k Impressions"
                  color="amber"
                />
                <SignalCard 
                  type="ISSUE" 
                  time="5h ago" 
                  title="OpenAI API Latency Spikes" 
                  description="Multiple developers reporting 502 errors and high latency on GPT-4-turbo endpoint. Status page updated to 'Investigating'."
                  source="Dev Forum"
                  severity="High Severity"
                  color="red"
                />
                <SignalCard 
                  type="UPDATE" 
                  time="7h ago" 
                  title="Mistral Announces New Partnership" 
                  description="Strategic partnership announced focusing on enterprise deployment and fine-tuning capabilities for European markets."
                  source="TechCrunch"
                  color="blue"
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Trending Keywords */}
              <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-semibold text-white">Trending Keywords</h3>
                  <button className="text-slate-500 hover:text-slate-300 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <KeywordPill label="LLM" trend="+24%" />
                  <KeywordPill label="Agents" />
                  <KeywordPill label="LangChain" />
                  <KeywordPill label="OpenAI" trend="+12%" />
                  <KeywordPill label="Vector DB" />
                  <KeywordPill label="RAG" />
                  <KeywordPill label="AutoGPT" />
                  <KeywordPill label="Llama 3" trend="+85%" />
                  <KeywordPill label="Fine-tuning" />
                  <KeywordPill label="Mistral" />
                  <KeywordPill label="networkchuck" />
                </div>
              </div>

              {/* Source Activity */}
              <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-white">Source Activity</h3>
                  <span className="text-[11px] font-medium px-2 py-1 bg-[#2A2E39] text-slate-300 rounded">Last 24h</span>
                </div>
                <div className="space-y-5">
                  <ActivityBar label="r/LocalLLaMA" value={85} status="Very High" color="bg-emerald-500" />
                  <ActivityBar label="r/OpenAI" value={70} status="High" color="bg-emerald-500" />
                  <ActivityBar label="Hacker News" value={65} status="High" color="bg-emerald-500" />
                  <ActivityBar label="GitHub Trending" value={45} status="Moderate" color="bg-amber-500" />
                  <ActivityBar label="r/MachineLearning" value={40} status="Moderate" color="bg-amber-500" />
                </div>
              </div>

              {/* Geographic Interest */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Geographic Interest (Top 3)</h3>
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
    </div>
  );
}

// Components

function NavItem({ icon, label, active, badge }: { icon: React.ReactNode, label: string, active?: boolean, badge?: string }) {
  return (
    <a href="#" className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-[#2A2E39] hover:text-white'}`}>
      <div className="flex items-center gap-3">
        {icon}
        {label}
      </div>
      {badge && (
        <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
          {badge}
        </span>
      )}
    </a>
  );
}

function StatCard({ title, value, trend, icon, iconBg, trendUp }: { title: string, value: string, trend: string, icon: React.ReactNode, iconBg: string, trendUp: boolean }) {
  return (
    <div className="bg-[#1A1D24] border border-[#2A2E39] rounded-xl p-4 flex flex-col justify-between h-[110px]">
      <div className="flex justify-between items-start">
        <span className="text-sm text-slate-400 font-medium">{title}</span>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-semibold text-white mb-1">{value}</div>
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

function SignalCard({ type, time, title, description, source, likes, comments, impressions, severity, color }: any) {
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
    <div className={`bg-[#1A1D24] border border-[#2A2E39] border-l-2 ${borderMap[color]} rounded-xl p-5 hover:bg-[#1E222A] transition-colors cursor-pointer group`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${colorMap[color]}`}>
            {type}
          </span>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </div>
      
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
        <div className="flex items-center gap-1.5 bg-[#2A2E39]/50 px-2 py-1 rounded">
          {source.includes('r/') ? <MessageSquare className="w-3.5 h-3.5 text-orange-500" /> : 
           source.includes('Twitter') ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current text-slate-300"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> :
           <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />}
          <span className="text-slate-300">{source}</span>
        </div>
        
        {likes && (
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
            {likes}
          </div>
        )}
        {comments && (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {comments}
          </div>
        )}
        {impressions && (
          <div className="flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5" />
            {impressions}
          </div>
        )}
        {severity && (
          <div className="flex items-center gap-1 text-red-400">
            <TriangleAlert className="w-3.5 h-3.5" />
            {severity}
          </div>
        )}
      </div>
    </div>
  );
}

function KeywordPill({ label, trend }: { label: string, trend?: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2A2E39]/50 border border-[#2A2E39] rounded-full text-xs font-medium text-slate-300 hover:bg-[#2A2E39] transition-colors cursor-pointer">
      {label}
      {trend && <span className="text-blue-400 text-[10px]">{trend}</span>}
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
      <div className="h-1.5 bg-[#2A2E39] rounded-full overflow-hidden">
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
