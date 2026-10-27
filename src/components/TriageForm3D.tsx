import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  User,
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Bone,
} from 'lucide-react';
import { Department, QueueToken, TriageAiOutput, TriageInput } from '@/lib/types';

interface TriageForm3DProps {
  onSuccess?: (token: QueueToken) => void;
}

const symptomPresets = [
  {
    label: '❤️ Chest Pain & Radiating Pain (Critical)',
    dept: 'CARDIOLOGY' as Department,
    symptoms: 'Substernal pressure radiating to left arm and jaw, diaphoresis, shortness of breath.',
    age: 58,
  },
  {
    label: '🌡️ High Fever & Cough (Moderate)',
    dept: 'GENERAL_MEDICINE' as Department,
    symptoms: 'Fever 102.5°F for 48 hours with productive cough, chills, and mild fatigue.',
    age: 32,
  },
  {
    label: '🦴 Ankle Inversion Sprain (Moderate)',
    dept: 'ORTHOPEDICS' as Department,
    symptoms: 'Right lateral ankle inversion twist with rapid edema and inability to bear full weight.',
    age: 26,
  },
  {
    label: '🤧 Seasonal Allergy & Sinus (Routine)',
    dept: 'GENERAL_MEDICINE' as Department,
    symptoms: 'Nasal congestion, watery eyes, sneezing fits, and frontal headache for 4 days.',
    age: 21,
  },
];

export const TriageForm3D: React.FC<TriageForm3DProps> = ({ onSuccess }) => {
  const router = useRouter();

  const [formData, setFormData] = useState<TriageInput>({
    patient_name: '',
    age: 35,
    department: 'GENERAL_MEDICINE',
    symptoms: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{ token: QueueToken; triage: TriageAiOutput } | null>(null);

  const applyPreset = (preset: (typeof symptomPresets)[0]) => {
    setFormData((prev) => ({
      ...prev,
      patient_name: prev.patient_name || 'Demo Patient',
      age: preset.age,
      department: preset.dept,
      symptoms: preset.symptoms,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.patient_name.trim()) {
      setErrorMessage('Please enter the patient’s full name');
      return;
    }
    if (!formData.symptoms.trim() || formData.symptoms.trim().length < 3) {
      setErrorMessage('Please describe the symptoms in detail');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process AI triage');
      }

      setResult({
        token: data.data.token,
        triage: data.data.triage,
      });

      // Confetti celebration
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#7C3AED', '#A855F7', '#F3E8FF', '#10B981'],
        });
      } catch {
        // ignore if canvas not supported
      }

      if (onSuccess) {
        onSuccess(data.data.token);
      }
    } catch (err: any) {
      console.error('Triage error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during AI triage');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setFormData({
      patient_name: '',
      age: 35,
      department: 'GENERAL_MEDICINE',
      symptoms: '',
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="card-3d rounded-3xl p-6 sm:p-8 bg-white border border-purple-100/90 shadow-[0_20px_40px_rgba(124,58,237,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-purple-100">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-lg shadow-purple-600/25">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  AI Patient Check-In & Triage
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Powered by Gemini 2.5 Flash — Instant priority scoring & wait-time prediction
                </p>
              </div>
            </div>

            {/* Quick Presets Bar */}
            <div className="my-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
                One-Click Symptom Presets (For Testing & Demos)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {symptomPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="text-left p-2.5 rounded-xl border border-purple-100 bg-purple-50/40 hover:bg-purple-100/60 hover:border-purple-300 transition-all text-xs font-medium text-slate-700 flex items-center justify-between group"
                  >
                    <span className="truncate">{preset.label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#7C3AED] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Patient Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-50/30 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white text-slate-900 font-medium text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Patient Age */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Age (Years) *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="number"
                      required
                      min={0}
                      max={125}
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-purple-50/30 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white text-slate-900 font-medium text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Department Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Target Department / Doctor Cabin *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'GENERAL_MEDICINE' as Department, name: 'General Medicine', cabin: 'Cabin 101', icon: Stethoscope },
                    { id: 'CARDIOLOGY' as Department, name: 'Cardiology', cabin: 'Cabin 102', icon: HeartPulse },
                    { id: 'ORTHOPEDICS' as Department, name: 'Orthopedics', cabin: 'Cabin 103', icon: Bone },
                  ].map((dept) => {
                    const isSelected = formData.department === dept.id;
                    const Icon = dept.icon;
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, department: dept.id })}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#7C3AED] bg-purple-50 shadow-sm ring-2 ring-[#7C3AED]/20'
                            : 'border-purple-100 bg-white hover:bg-purple-50/50'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isSelected ? 'bg-[#7C3AED] text-white' : 'bg-purple-50 text-[#7C3AED]'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{dept.name}</p>
                          <p className="text-[11px] text-slate-500 font-medium">{dept.cabin}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Symptoms Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reported Clinical Symptoms & Vitals *
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe patient's chief complaint, duration, onset, severity, and any vital indicators..."
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                    className="w-full p-3 rounded-xl bg-purple-50/30 border border-purple-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white text-slate-900 font-medium text-sm transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-3d w-full py-3.5 px-6 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 tracking-wide cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2.5">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gemini 2.5 Flash Triaging Symptoms...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Run AI Triage & Check-In Patient</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Live Result Card */
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-3d rounded-3xl p-6 sm:p-8 bg-white border-2 border-purple-300 shadow-[0_25px_50px_rgba(124,58,237,0.18)]"
          >
            {/* Top Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-extrabold text-sm uppercase tracking-wide">
                  Check-In & Triage Complete
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-[#7C3AED] border border-purple-200">
                Gemini 2.5 Flash Verified
              </span>
            </div>

            {/* Generated Token 3D Display */}
            <div className="my-6 text-center">
              <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-1">
                Assigned Queue Token
              </p>
              <div className="inline-block px-8 py-3.5 rounded-3xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] text-white shadow-xl shadow-purple-600/35 border-2 border-purple-300">
                <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight">
                  {result.token.token_number}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 mt-2">
                {result.token.patient_name}{' '}
                <span className="text-xs font-medium text-slate-400">({result.token.age} yrs)</span>
              </p>
            </div>

            {/* AI Triage Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {/* Urgency Badge */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Urgency Tier</p>
                <p
                  className={`text-base font-black mt-1 ${
                    result.triage.urgency_level === 'CRITICAL'
                      ? 'text-rose-600'
                      : result.triage.urgency_level === 'MODERATE'
                      ? 'text-[#7C3AED]'
                      : 'text-slate-700'
                  }`}
                >
                  {result.triage.urgency_level}
                </p>
              </div>

              {/* Priority Score */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Priority Score</p>
                <p className="text-base font-black text-[#7C3AED] mt-1">
                  {result.triage.priority_score} / 100
                </p>
              </div>

              {/* Est Duration */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Consult Duration</p>
                <p className="text-base font-black text-slate-800 mt-1">
                  ~{result.triage.estimated_mins} mins
                </p>
              </div>
            </div>

            {/* AI Clinical Note */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50/40 border border-purple-200 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                <span className="text-xs font-extrabold text-[#7C3AED] uppercase tracking-wide">
                  Gemini Clinical Advisory Note
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                {result.triage.ai_note}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="btn-3d w-full py-3 px-5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>View Live Position on 3D Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={resetForm}
                className="btn-3d-subtle w-full sm:w-auto py-3 px-5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check-In Another</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
