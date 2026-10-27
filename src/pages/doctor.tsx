import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope,
  HeartPulse,
  Bone,
  CheckCircle2,
  Play,
  Siren,
  Clock,
  Sparkles,
  User,
  ArrowRight,
  ShieldAlert,
  FileEdit,
  Activity,
} from 'lucide-react';
import { Navbar3D } from '@/components/Navbar3D';
import { Cabin, Department, QueueToken } from '@/lib/types';

export default function DoctorConsole() {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [queue, setQueue] = useState<QueueToken[]>([]);
  const [allTokens, setAllTokens] = useState<QueueToken[]>([]);
  const [selectedCabinNumber, setSelectedCabinNumber] = useState<string>('101');
  const [doctorNotes, setDoctorNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.success && data.data) {
        setCabins(data.data.cabins || []);
        setQueue(data.data.queue || []);
        setAllTokens(data.data.allTokens || []);
      }
    } catch (err) {
      console.error('Failed to load clinic state:', err);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 4000);
    return () => clearInterval(interval);
  }, [fetchState]);

  const selectedCabin = cabins.find((c) => c.cabin_number === selectedCabinNumber) || cabins[0];
  const currentToken = selectedCabin
    ? allTokens.find((t) => t.token_number === selectedCabin.current_token)
    : null;

  // Department upcoming waiting queue
  const departmentWaitingQueue = selectedCabin
    ? queue.filter((t) => t.department === selectedCabin.department)
    : [];

  const handleAdvance = async () => {
    if (!selectedCabin) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/advance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cabin_number: selectedCabin.cabin_number }),
      });
      if (res.ok) {
        setStatusMessage(`Cabin ${selectedCabin.cabin_number} advanced successfully`);
        setTimeout(() => setStatusMessage(null), 3000);
        await fetchState();
      }
    } catch (err) {
      console.error('Error advancing cabin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerEmergency = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: selectedCabin?.department || 'CARDIOLOGY',
          patient_name: 'Code Red Hospital Emergency',
        }),
      });
      if (res.ok) {
        setStatusMessage('STAT Emergency patient triaged and dispatched to priority queue!');
        setTimeout(() => setStatusMessage(null), 4000);
        await fetchState();
      }
    } catch (err) {
      console.error('Error dispatching emergency:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] text-slate-900 pb-20">
      <Head>
        <title>Doctor Cabin Control Panel | MediFlow 3D</title>
      </Head>

      <Navbar3D />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#7C3AED] text-xs font-bold border border-purple-200 mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Physician & Clinician Operations Console</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Doctor Cabin Control Panel
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Manage patient consultations, advance department queues, and record clinical diagnosis notes.
            </p>
          </div>

          {/* Cabin Switcher Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-white border border-purple-100 rounded-2xl shadow-sm">
            {cabins.map((c) => {
              const isSelected = c.cabin_number === selectedCabinNumber;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCabinNumber(c.cabin_number)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-600/25'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50'
                  }`}
                >
                  Cabin {c.cabin_number}
                </button>
              );
            })}
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {selectedCabin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Active Patient & Doctor Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Consultation Card */}
              <div className="card-3d rounded-3xl p-6 sm:p-8 bg-white border border-purple-100/90 shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
                <div className="flex items-center justify-between pb-4 border-b border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] font-bold text-lg shadow-inner">
                      🏥
                    </div>
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">
                        Cabin {selectedCabin.cabin_number} — {selectedCabin.doctor_name}
                      </h2>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] border border-purple-200">
                        {selectedCabin.department}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      selectedCabin.status === 'IN_CONSULTATION'
                        ? 'bg-purple-50 text-[#7C3AED] border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {selectedCabin.status === 'IN_CONSULTATION' ? 'In Consultation' : 'Available'}
                  </span>
                </div>

                {currentToken ? (
                  <div className="mt-6 space-y-6">
                    {/* Active Patient Details Banner */}
                    <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm">
                            {currentToken.token_number}
                          </span>
                          <span className="text-sm font-extrabold text-slate-900">
                            {currentToken.patient_name}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            ({currentToken.age} yrs)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Urgency:{' '}
                          <span className="font-bold text-[#7C3AED]">
                            {currentToken.urgency_level}
                          </span>{' '}
                          • Priority Score: {currentToken.priority_score} / 100
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-slate-700">
                          Est. Duration: ~{currentToken.estimated_mins}m
                        </span>
                      </div>
                    </div>

                    {/* Reported Symptoms */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Reported Symptoms & Patient Chief Complaint
                      </label>
                      <p className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800">
                        {currentToken.symptoms}
                      </p>
                    </div>

                    {/* AI Clinical Note */}
                    {currentToken.ai_note && (
                      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                        <div className="flex items-center gap-1.5 text-[#7C3AED] text-xs font-bold uppercase mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Gemini Clinical Advisory</span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">{currentToken.ai_note}</p>
                      </div>
                    )}

                    {/* Doctor Clinical Diagnosis Notepad */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <FileEdit className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <span>Physician Consultation Notes & Prescription</span>
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Write clinical findings, prescription notes, and disposition instructions..."
                        value={doctorNotes[currentToken.token_number] || ''}
                        onChange={(e) =>
                          setDoctorNotes({
                            ...doctorNotes,
                            [currentToken.token_number]: e.target.value,
                          })
                        }
                        className="w-full p-3 rounded-xl bg-purple-50/30 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-slate-400 text-sm font-medium">
                      No active patient in consultation for Cabin {selectedCabin.cabin_number}.
                    </p>
                    <p className="text-xs text-purple-600 font-semibold mt-1">
                      Ready to call next patient from queue.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-6 border-t border-purple-100 mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleAdvance}
                    disabled={isLoading}
                    className="btn-3d w-full sm:flex-1 py-3 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>
                      {currentToken ? 'Complete & Call Next Patient' : 'Call Next Patient'}
                    </span>
                  </button>

                  <button
                    onClick={handleTriggerEmergency}
                    disabled={isLoading}
                    className="btn-3d-subtle w-full sm:w-auto py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Siren className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>Flag STAT Emergency</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Department Queue Waiting */}
            <div>
              <div className="card-3d rounded-3xl p-6 bg-white border border-purple-100/90 shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
                <div className="flex items-center justify-between pb-4 border-b border-purple-100">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Upcoming for {selectedCabin.department}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Department waiting list</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[#7C3AED] text-xs font-bold border border-purple-200">
                    {departmentWaitingQueue.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {departmentWaitingQueue.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      No patients currently waiting for {selectedCabin.department}.
                    </div>
                  ) : (
                    departmentWaitingQueue.map((tok, idx) => (
                      <div
                        key={tok.id}
                        className="p-3 rounded-xl bg-purple-50/40 border border-purple-100 hover:border-purple-300 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded-md">
                            {tok.token_number}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              tok.urgency_level === 'CRITICAL'
                                ? 'bg-rose-100 text-rose-700'
                                : tok.urgency_level === 'MODERATE'
                                ? 'bg-purple-100 text-[#7C3AED]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {tok.urgency_level}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 mt-1.5">
                          {tok.patient_name}{' '}
                          <span className="text-[11px] font-medium text-slate-400">
                            ({tok.age}y)
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                          {tok.symptoms}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
