
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppMode, TrendData, TrendItem, Region } from './types';
import { fetchTrends } from './services/geminiService';
import { 
  TrendingUp, 
  Music, 
  Hash, 
  Video, 
  Globe, 
  Heart, 
  RefreshCw, 
  ExternalLink,
  Info,
  Activity,
  Layers,
  Facebook,
  Flag,
  Globe2,
  Clock
} from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('global');
  const [region, setRegion] = useState<Region>('arab');
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const loadData = useCallback(async (currentMode: AppMode, currentRegion: Region) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchTrends(currentMode, currentRegion);
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to sync trends. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(mode, region);
    setSelectedPlatform('All');
    setSelectedCategory('All');
  }, [mode, region, loadData]);

  const allPlatforms = useMemo(() => {
    const defaults = ['All', 'Facebook', 'TikTok', 'Instagram', 'X', 'YouTube'];
    if (!data) return defaults;
    const found = new Set<string>();
    data.items.forEach(item => item.platform.forEach(p => found.add(p)));
    return Array.from(new Set([...defaults, ...Array.from(found)]));
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    return data.items.filter(item => {
      const pMatch = selectedPlatform === 'All' || item.platform.some(p => p.toLowerCase().includes(selectedPlatform.toLowerCase()));
      const cMatch = selectedCategory === 'All' || item.category === selectedCategory.toLowerCase();
      return pMatch && cMatch;
    });
  }, [data, selectedPlatform, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] text-slate-200">
      {/* Sidebar */}
      <nav className="w-full md:w-72 glass p-6 flex flex-col gap-8 border-r border-white/5 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase">SocialPulse</h1>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 mb-1">Intelligence Mode</p>
          <button 
            onClick={() => setMode('global')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${mode === 'global' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Globe className="w-5 h-5" />
            <span className="font-bold text-sm">Global Trends</span>
          </button>
          <button 
            onClick={() => setMode('ngo')}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all ${mode === 'ngo' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Heart className="w-5 h-5" />
            <span className="font-bold text-sm">NGO & Impact</span>
          </button>
        </div>

        {/* Region Selector */}
        <div className="flex flex-col gap-2 mt-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 mb-1">Target Region</p>
          <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
            <button 
              onClick={() => setRegion('arab')}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${region === 'arab' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Flag className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Arab World</span>
            </button>
            <button 
              onClick={() => setRegion('international')}
              className={`flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${region === 'international' ? 'bg-white/10 text-white border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Globe2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">International</span>
            </button>
          </div>
        </div>

        <div className="mt-auto">
          <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-indigo-500/20">
            <h4 className="text-xs font-black text-indigo-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
              <Clock className="w-3 h-3" /> Latest Window
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Data is synced for the last 90 days with priority on current 24-hour viral activity.
            </p>
          </div>
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 p-4 md:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                {region === 'arab' ? 'MENA Focus (Egypt & Arab)' : 'International / Global West'}
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                Daily Update
              </span>
            </div>
            <h2 className="text-5xl font-black text-white leading-tight">
              Pulse Intelligence
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              Showing top 6 items per category for <span className="text-blue-400">Facebook</span> and more.
            </p>
          </div>
          <button 
            onClick={() => loadData(mode, region)}
            disabled={loading}
            className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 hover:bg-indigo-50 rounded-3xl transition-all disabled:opacity-50 font-black text-sm uppercase tracking-widest shadow-2xl shadow-white/10"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Sync Today's Data
          </button>
        </header>

        {/* Dynamic Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Platform Filter */}
          <div className="glass p-6 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <Flag className="w-3 h-3" /> Platforms Focus
            </div>
            <div className="flex flex-wrap gap-2">
              {allPlatforms.map(p => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedPlatform === p 
                      ? 'bg-white text-slate-900 border-white shadow-xl' 
                      : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="glass p-6 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
              <Layers className="w-3 h-3" /> Content Verticals
            </div>
            <div className="flex flex-wrap gap-2">
              {['All', 'Music', 'Content', 'Hashtag'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all border ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-xl' 
                      : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-3xl mb-12 flex items-center gap-4">
            <Info className="w-6 h-6 shrink-0" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 glass rounded-[2.5rem] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Analysis Summary */}
            {data?.analysis && selectedPlatform === 'All' && (
              <div className="glass p-10 rounded-[3rem] mb-12 border border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Strategic Overview (Last 90 Days)</h3>
                  <p className="text-white/90 text-2xl font-bold leading-relaxed max-w-5xl">
                    {data.analysis}
                  </p>
                </div>
                <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px]" />
              </div>
            )}

            {/* Trends Section - Structured by Category if "All" is selected */}
            <div className="space-y-16">
              {selectedCategory === 'All' ? (
                <>
                  <CategorySection title="Top 6 Music Trends" category="music" items={data?.items.filter(i => i.category === 'music') || []} />
                  <CategorySection title="Top 6 Content Discussions" category="content" items={data?.items.filter(i => i.category === 'content') || []} />
                  <CategorySection title="Top 6 Hashtags" category="hashtag" items={data?.items.filter(i => i.category === 'hashtag') || []} />
                </>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item, idx) => (
                    <TrendCard key={idx} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Contextual Links */}
            {data?.sources && data.sources.length > 0 && (
              <div className="mt-20 pt-10 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Verification Nodes</h3>
                <div className="flex flex-wrap gap-4">
                  {data.sources.map((s, i) => (
                    <a 
                      key={i} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[11px] font-black text-slate-400 hover:text-white transition-all flex items-center gap-3 uppercase tracking-widest"
                    >
                      {s.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

const CategorySection: React.FC<{ title: string, category: string, items: TrendItem[] }> = ({ title, items }) => {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{title}</h3>
        <div className="h-[1px] flex-1 bg-white/5" />
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Showing {items.length} Items</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, idx) => (
          <TrendCard key={idx} item={item} />
        ))}
      </div>
    </section>
  );
};

const TrendCard: React.FC<{ item: TrendItem }> = ({ item }) => {
  const getIcon = (cat: string) => {
    switch (cat) {
      case 'music': return <Music className="w-5 h-5" />;
      case 'hashtag': return <Hash className="w-5 h-5" />;
      default: return <Video className="w-5 h-5" />;
    }
  };

  const getAccentColor = (cat: string) => {
    switch (cat) {
      case 'music': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
      case 'hashtag': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
    }
  };

  return (
    <a 
      href={item.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group glass p-10 rounded-[2.5rem] border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex items-center justify-between mb-8">
        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 ${getAccentColor(item.category)}`}>
          {getIcon(item.category)}
          {item.category}
        </span>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-black text-[11px] tracking-widest uppercase">{item.momentum}% Velocity</span>
        </div>
      </div>

      <h4 className="text-3xl font-black text-white mb-4 leading-[1.1] group-hover:text-indigo-300 transition-colors">
        {item.title}
      </h4>

      <p className="text-slate-400 text-sm mb-10 line-clamp-4 leading-relaxed font-medium">
        {item.description}
      </p>

      <div className="mt-auto flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          {item.platform.map(p => (
            <span key={p} className="flex items-center gap-2 px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {p.toLowerCase().includes('facebook') && <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />}
              {p}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Impact Index</span>
          <span className="text-xs font-black text-white px-3 py-1 bg-white/10 rounded-lg border border-white/10">
            {item.engagement}
          </span>
        </div>
      </div>
    </a>
  );
};

export default App;
