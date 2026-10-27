import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, Cpu, Activity, Clock, CheckCircle } from 'lucide-react';
import { Navbar3D } from '@/components/Navbar3D';
import { TriageForm3D } from '@/components/TriageForm3D';
import { QueueToken } from '@/lib/types';

export default function TriagePage() {
  const [recentToken, setRecentToken] = useState<QueueToken | null>(null);

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-slate-900 pb-20">
      <Head>
        <title>AI Patient Check-In & Triage | MediFlow 3D</title>
      </Head>

      <Navbar3D />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#7C3AED] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to 3D Clinic Dashboard</span>
          </Link>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-[#7C3AED] text-xs font-bold border border-purple-200">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model: Gemini 2.5 Flash</span>
          </div>
        </div>

        {/* AI Triage Check-In Form */}
        <TriageForm3D onSuccess={(token) => setRecentToken(token)} />

        {/* Feature Explainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto pt-4">
          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_10px_25px_-5px_rgba(124,58,237,0.06)]">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold mb-3 border border-purple-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Multimodal Clinical Triaging</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Gemini 2.5 Flash parses raw clinical symptoms and categorizes acuity into Routine (10), Moderate (50), or Critical (95).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_10px_25px_-5px_rgba(124,58,237,0.06)]">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold mb-3 border border-purple-100">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Dynamic Wait-Time Prediction</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Estimated duration is modeled from symptom severity and real-time cabin throughput, eliminating guessing for patients.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-[0_10px_25px_-5px_rgba(124,58,237,0.06)]">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center font-bold mb-3 border border-purple-100">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Realtime Queue Priority</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
              Critical conditions bypass routine visits in Supabase Realtime, immediately notifying physician cabins 101, 102, and 103.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
