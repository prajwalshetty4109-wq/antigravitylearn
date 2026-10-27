import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Search, Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck, HeartPulse } from 'lucide-react';
import { Navbar3D } from '@/components/Navbar3D';
import { CabinCard3D } from '@/components/CabinCard3D';
import { TokenQueueList } from '@/components/TokenQueueList';
import { SimulatorBar } from '@/components/SimulatorBar';
import { StatsBanner } from '@/components/StatsBanner';
import { Cabin, QueueToken } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function Home() {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [queue, setQueue] = useState<QueueToken[]>([]);
  const [allTokens, setAllTokens] = useState<QueueToken[]>([]);
  const [dataSource, setDataSource] = useState<'supabase' | 'in-memory-fallback'>('in-memory-fallback');
  const [isLoading, setIsLoading] = useState(true);
  const [searchToken, setSearchToken] = useState('');
  const [searchResult, setSearchResult] = useState<QueueToken | null>(null);

  // Fetch state from API
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.success && data.data) {
        setCabins(data.data.cabins || []);
        setQueue(data.data.queue || []);
        setAllTokens(data.data.allTokens || []);
        setDataSource(data.data.dataSource || 'in-memory-fallback');
      }
    } catch (err) {
      console.error('Failed to load clinic state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up initial load and Supabase Realtime subscription (or fast polling fallback)
  useEffect(() => {
    fetchState();

    // If Supabase is configured, listen to realtime table changes
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel('schema-db-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'cabins' }, () => {
            fetchState();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_tokens' }, () => {
            fetchState();
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription error:', err);
      }
    }

    // Auto-refresh interval for smooth live updates
    const interval = setInterval(() => {
      fetchState();
    }, 4000);

    return () => {
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [fetchState]);

  // Handler for advancing a specific cabin
  const handleAdvanceCabin = async (cabinNumber: string) => {
    try {
      const res = await fetch('/api/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cabin_number: cabinNumber }),
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Error advancing cabin queue:', err);
    }
  };

  // Simulator actions
  const handleCallNext = async () => {
    // Pick the first available cabin, or Cabin 101 by default
    const availableCabin = cabins.find((c) => c.status === 'AVAILABLE') || cabins[0];
    if (availableCabin) {
      await handleAdvanceCabin(availableCabin.cabin_number);
    }
  };

  const handleAddEmergency = async () => {
    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Emergency trigger error:', err);
    }
  };

  const handleResetDemo = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await fetchState();
      }
    } catch (err) {
      console.error('Reset demo error:', err);
    }
  };

  // Handle Token Search for Patient Track
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchToken.trim()) {
      setSearchResult(null);
      return;
    }
    const cleanQuery = searchToken.trim().toUpperCase();
    const found = allTokens.find((t) => t.token_number.toUpperCase() === cleanQuery);
    setSearchResult(found || null);
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-slate-900 pb-20">
      <Head>
        <title>MediFlow 3D | Hospital Live Queue & Triage Dashboard</title>
      </Head>

      <Navbar3D dataSource={dataSource} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#7C3AED] text-xs font-bold border border-purple-200 mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next-Gen 3D White & Purple Clinic Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Hospital Live Queue & Triage Center
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-2xl mt-1">
              Real-time token tracking, Gemini 2.5 Flash urgency classification, and dynamic cabin assignment.
            </p>
          </div>

          {/* Quick Token Search Box for Patients */}
          <form onSubmit={handleSearch} className="w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Track Token e.g. TK-103..."
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white border border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] text-xs font-semibold shadow-sm"
              />
              <button
                type="submit"
                className="btn-3d absolute right-1.5 top-1.5 px-3 py-1.5 bg-[#7C3AED] text-white rounded-xl text-xs font-bold"
              >
                Track
              </button>
            </div>
          </form>
        </div>

        {/* Patient Token Track Result Alert */}
        {searchResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-white border-2 border-purple-300 shadow-md shadow-purple-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm">
                {searchResult.token_number}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {searchResult.patient_name}{' '}
                  <span className="text-xs text-slate-400">({searchResult.age}y)</span>
                </p>
                <p className="text-xs text-slate-500">
                  Status:{' '}
                  <span className="font-bold text-[#7C3AED]">{searchResult.status}</span> •
                  Dept: <span className="font-semibold">{searchResult.department}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-[#7C3AED] border border-purple-200">
                Priority Score: {searchResult.priority_score}
              </span>
              <button
                onClick={() => setSearchResult(null)}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}

        {/* Live KPIs & Metrics */}
        <StatsBanner cabins={cabins} queue={queue} />

        {/* Simulator Bar */}
        <SimulatorBar
          onCallNext={handleCallNext}
          onAddEmergency={handleAddEmergency}
          onResetDemo={handleResetDemo}
          disabled={isLoading}
        />

        {/* Section: 3D Doctor Cabins */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>3D Doctor Cabin Suites</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED]">
                  {cabins.length} Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Live doctor consultation status and current active tokens
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cabins.map((cabin) => {
              const currentTokenData = allTokens.find((t) => t.token_number === cabin.current_token);
              return (
                <CabinCard3D
                  key={cabin.id}
                  cabin={cabin}
                  currentTokenData={currentTokenData}
                  onAdvance={handleAdvanceCabin}
                  isLoading={isLoading}
                />
              );
            })}
          </div>
        </div>

        {/* Section: Live Queue List */}
        <div>
          <TokenQueueList tokens={queue} />
        </div>
      </main>
    </div>
  );
}
