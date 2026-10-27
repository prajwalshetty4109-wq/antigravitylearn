import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, Stethoscope, PlusCircle, UserCheck, ShieldCheck, Zap } from 'lucide-react';

interface Navbar3DProps {
  dataSource?: 'supabase' | 'in-memory-fallback';
}

export const Navbar3D: React.FC<Navbar3DProps> = ({ dataSource = 'in-memory-fallback' }) => {
  const router = useRouter();

  const navLinks = [
    { href: '/', label: '3D Clinic Hub', icon: Activity },
    { href: '/triage', label: 'AI Patient Check-In', icon: PlusCircle },
    { href: '/doctor', label: 'Doctor Cabin Controls', icon: Stethoscope },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#FAF9FF]/85 border-b border-purple-100/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo with 3D purple cross */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] p-[2px] shadow-lg shadow-purple-600/30 transform transition-transform group-hover:scale-105 group-hover:rotate-1">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-white" />
              <div className="relative flex items-center justify-center text-[#7C3AED]">
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                Medi<span className="text-[#7C3AED]">Flow</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] border border-purple-200">
                3D AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Hospital Live Queue & Triage</p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 p-1.5 bg-white/80 border border-purple-100 rounded-2xl shadow-sm">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-600/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-600'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Status Badge & CTA */}
        <div className="flex items-center gap-3">
          {/* Realtime / Fallback indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-purple-100 shadow-sm text-xs font-medium text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dataSource === 'supabase' ? 'bg-emerald-400' : 'bg-purple-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${dataSource === 'supabase' ? 'bg-emerald-500' : 'bg-[#7C3AED]'}`}></span>
            </span>
            <span className="truncate max-w-[140px]">
              {dataSource === 'supabase' ? 'Supabase Realtime' : 'Local Memory Synced'}
            </span>
          </div>

          <Link
            href="/triage"
            className="btn-3d flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-bold tracking-wide"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Check-In Patient</span>
            <span className="sm:hidden">Check-In</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
