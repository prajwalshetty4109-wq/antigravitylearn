import React, { useState } from 'react';
import { Play, Siren, RotateCcw, Sparkles, Check, ChevronRight } from 'lucide-react';

interface SimulatorBarProps {
  onCallNext: () => Promise<void>;
  onAddEmergency: () => Promise<void>;
  onResetDemo: () => Promise<void>;
  disabled?: boolean;
}

export const SimulatorBar: React.FC<SimulatorBarProps> = ({
  onCallNext,
  onAddEmergency,
  onResetDemo,
  disabled = false,
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const handleAction = async (actionName: string, actionFn: () => Promise<void>) => {
    try {
      setActiveAction(actionName);
      await actionFn();
    } finally {
      setTimeout(() => setActiveAction(null), 400);
    }
  };

  return (
    <div className="relative">
      <div className="card-3d rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-white via-purple-50/40 to-white border border-purple-200/90 shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Label & Description */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#7C3AED] flex items-center justify-center text-white shadow-md shadow-purple-600/30">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-slate-900 tracking-tight">
                  One-Click Interactive Simulator
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#7C3AED] border border-purple-200 uppercase">
                  Live Control Bar
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Simulate real-time clinic operations, triage intake, and queue advancement for judges & staff
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center w-full lg:w-auto">
            {/* Call Next Patient */}
            <button
              onClick={() => handleAction('callNext', onCallNext)}
              disabled={disabled || activeAction !== null}
              className="btn-3d flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{activeAction === 'callNext' ? 'Calling...' : 'Call Next Patient'}</span>
            </button>

            {/* Add Emergency Case */}
            <button
              onClick={() => handleAction('emergency', onAddEmergency)}
              disabled={disabled || activeAction !== null}
              className="btn-3d-subtle flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 disabled:opacity-50 font-bold text-xs sm:text-sm cursor-pointer"
            >
              <Siren className="w-4 h-4 text-rose-600 animate-bounce" />
              <span>{activeAction === 'emergency' ? 'Triage Alerting...' : 'Add Emergency Case'}</span>
            </button>

            {/* Reset Demo */}
            <button
              onClick={() => handleAction('reset', onResetDemo)}
              disabled={disabled || activeAction !== null}
              className="btn-3d-subtle flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-slate-600 hover:text-slate-900 disabled:opacity-50 font-semibold text-xs sm:text-sm cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${activeAction === 'reset' ? 'animate-spin' : ''}`} />
              <span>{activeAction === 'reset' ? 'Resetting...' : 'Reset Demo'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
