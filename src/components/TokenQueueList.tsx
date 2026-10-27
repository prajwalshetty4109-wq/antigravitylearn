import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, AlertTriangle, ShieldAlert, Sparkles, User, Flame, ArrowUpRight } from 'lucide-react';
import { QueueToken, UrgencyLevel, Department } from '@/lib/types';

interface TokenQueueListProps {
  tokens: QueueToken[];
  onSelectToken?: (token: QueueToken) => void;
}

const urgencyConfig: Record<
  UrgencyLevel,
  { label: string; badge: string; border: string; glow: string; icon: React.ComponentType<{ className?: string }> }
> = {
  CRITICAL: {
    label: 'Critical / STAT',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    border: 'border-l-4 border-l-rose-500 border-rose-200 bg-rose-50/20',
    glow: 'shadow-[0_10px_25px_-5px_rgba(244,63,94,0.15)]',
    icon: Flame,
  },
  MODERATE: {
    label: 'Moderate',
    badge: 'bg-purple-100 text-[#7C3AED] border-purple-200',
    border: 'border-l-4 border-l-[#7C3AED] border-purple-100',
    glow: 'shadow-[0_10px_25px_-5px_rgba(124,58,237,0.08)]',
    icon: AlertTriangle,
  },
  ROUTINE: {
    label: 'Routine',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    border: 'border-l-4 border-l-slate-400 border-purple-100/60',
    glow: 'shadow-sm',
    icon: Clock,
  },
};

const deptShort: Record<Department, string> = {
  GENERAL_MEDICINE: 'Gen Med',
  CARDIOLOGY: 'Cardiology',
  ORTHOPEDICS: 'Orthopedics',
};

export const TokenQueueList: React.FC<TokenQueueListProps> = ({ tokens }) => {
  // Compute cumulative wait times based on position in queue
  let cumulativeWait = 0;

  return (
    <div className="card-3d rounded-3xl p-6 bg-white border border-purple-100 shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-[#7C3AED] border border-purple-100 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Live Patient Queue
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Dynamic AI Triage prioritization & wait-time estimates
            </p>
          </div>
        </div>

        {/* Count Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-purple-50 text-[#7C3AED] border border-purple-200 text-xs font-extrabold">
          <span className="w-2 h-2 rounded-full bg-[#7C3AED]" />
          <span>{tokens.length} In Waiting Queue</span>
        </div>
      </div>

      {/* Queue Token List */}
      <div className="mt-5 space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {tokens.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 px-4 rounded-2xl bg-purple-50/40 border border-dashed border-purple-200"
            >
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#7C3AED] mx-auto shadow-sm border border-purple-100 mb-3 text-2xl">
                ✨
              </div>
              <h3 className="text-base font-bold text-slate-800">Queue is Clear!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All triage patients have been admitted to doctor cabins. Check in a new patient or trigger an emergency case.
              </p>
            </motion.div>
          ) : (
            tokens.map((token, index) => {
              const urgency = urgencyConfig[token.urgency_level] || urgencyConfig.ROUTINE;
              const UrgencyIcon = urgency.icon;

              // Cumulative wait: patient wait = sum of previous patients' estimated time / 3 cabins (parallel capacity)
              const waitAhead = index === 0 ? Math.max(2, Math.round(token.estimated_mins / 2)) : Math.round(cumulativeWait / 2.5) + 3;
              cumulativeWait += token.estimated_mins;

              return (
                <motion.div
                  key={token.id}
                  layout
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className={`p-4 rounded-2xl bg-white border transition-all hover:translate-x-1 ${urgency.border} ${urgency.glow}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Token Number, Position & Patient Info */}
                    <div className="flex items-center gap-3.5">
                      {/* Priority Rank Number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center font-extrabold text-xs text-[#7C3AED]">
                        #{index + 1}
                      </div>

                      {/* Token Pill */}
                      <div className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono font-bold text-sm shadow-sm tracking-wide">
                        {token.token_number}
                      </div>

                      {/* Patient Name, Age & Department */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {token.patient_name}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            ({token.age}y)
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-[#7C3AED] border border-purple-100">
                            {deptShort[token.department]}
                          </span>
                        </div>

                        {/* Symptoms Snippet */}
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                          {token.symptoms}
                        </p>
                      </div>
                    </div>

                    {/* Right: AI Triage Badge, Score & Estimated Wait */}
                    <div className="flex items-center gap-2.5 sm:self-center flex-wrap sm:flex-nowrap justify-between sm:justify-end">
                      {/* Urgency Badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${urgency.badge}`}>
                        <UrgencyIcon className="w-3.5 h-3.5" />
                        {urgency.label}
                      </span>

                      {/* AI Priority Score */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50/70 border border-purple-100 text-xs font-bold text-slate-700">
                        <span className="text-slate-400 font-medium text-[10px]">Score</span>
                        <span className="text-[#7C3AED]">{token.priority_score}</span>
                      </div>

                      {/* Wait Time Indicator */}
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>~{waitAhead}m wait</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Clinical Note if available */}
                  {token.ai_note && (
                    <div className="mt-2.5 pt-2 border-t border-purple-50/80 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-purple-900/80 font-medium italic">
                        {token.ai_note}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
