import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, HeartPulse, Bone, User, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Cabin, Department, QueueToken } from '@/lib/types';

interface CabinCard3DProps {
  cabin: Cabin;
  currentTokenData?: QueueToken | null;
  onAdvance: (cabinNumber: string) => Promise<void>;
  isLoading?: boolean;
}

const deptConfig: Record<
  Department,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; badge: string }
> = {
  GENERAL_MEDICINE: {
    label: 'General Medicine',
    icon: Stethoscope,
    color: 'from-purple-500 to-indigo-600',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  CARDIOLOGY: {
    label: 'Cardiology',
    icon: HeartPulse,
    color: 'from-rose-500 to-purple-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  ORTHOPEDICS: {
    label: 'Orthopedics',
    icon: Bone,
    color: 'from-blue-500 to-purple-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export const CabinCard3D: React.FC<CabinCard3DProps> = ({
  cabin,
  currentTokenData,
  onAdvance,
  isLoading = false,
}) => {
  const [isCalling, setIsCalling] = useState(false);
  const dept = deptConfig[cabin.department] || deptConfig.GENERAL_MEDICINE;
  const DeptIcon = dept.icon;

  const handleCallNext = async () => {
    try {
      setIsCalling(true);
      await onAdvance(cabin.cabin_number);
    } finally {
      setIsCalling(false);
    }
  };

  const isServing = cabin.status === 'IN_CONSULTATION' && cabin.current_token;

  return (
    <div className="relative group perspective">
      {/* 3D floating effect card */}
      <div className="card-3d rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-full min-h-[380px] bg-white border border-purple-100/90 shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
        {/* Top subtle gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${dept.color}`} />

        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#7C3AED] shadow-inner">
                <DeptIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
                    Cabin {cabin.cabin_number}
                  </h3>
                </div>
                <span className={`inline-block mt-0.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${dept.badge}`}>
                  {dept.label}
                </span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center">
              {isServing ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#7C3AED] border border-purple-200">
                  <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-ping" />
                  In Session
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Available
                </span>
              )}
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-purple-50/50 rounded-2xl border border-purple-100/60 mb-6">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#7C3AED] border border-purple-100 shadow-sm text-xs font-bold">
              👨‍⚕️
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Attending Physician</p>
              <p className="text-sm font-bold text-slate-800">{cabin.doctor_name}</p>
            </div>
          </div>
        </div>

        {/* Center 3D Active Token Display */}
        <div className="my-auto py-4">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Current Active Token
            </p>

            <AnimatePresence mode="wait">
              {isServing ? (
                <motion.div
                  key={cabin.current_token}
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -10 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="inline-block"
                >
                  <div className="relative group/token">
                    <div className="px-6 py-3 rounded-2xl bg-gradient-to-b from-white to-purple-50/60 border-2 border-purple-300 shadow-md shadow-purple-500/10">
                      <span className="font-extrabold text-3xl sm:text-4xl text-[#7C3AED] tracking-tight font-mono">
                        {cabin.current_token}
                      </span>
                    </div>
                  </div>

                  {/* Serving Patient Details */}
                  {currentTokenData && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 text-center"
                    >
                      <p className="text-sm font-bold text-slate-800">
                        {currentTokenData.patient_name}
                        <span className="text-xs font-medium text-slate-500 ml-1.5">
                          ({currentTokenData.age}y)
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 italic max-w-[260px] mx-auto mt-0.5">
                        &quot;{currentTokenData.symptoms}&quot;
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-4 px-6 rounded-2xl border border-dashed border-purple-200 bg-purple-50/30 inline-block"
                >
                  <p className="text-slate-400 text-sm font-medium">Ready for next patient</p>
                  <p className="text-xs text-purple-600 font-semibold mt-0.5">Queue waiting</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Call Next Button */}
        <div className="pt-4 border-t border-purple-50 mt-auto">
          <button
            onClick={handleCallNext}
            disabled={isLoading || isCalling}
            className="btn-3d w-full py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-60 text-white font-bold text-sm flex items-center justify-center gap-2 group/btn cursor-pointer"
          >
            {isCalling ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calling Patient...
              </span>
            ) : (
              <>
                <span>Call Next Patient</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
