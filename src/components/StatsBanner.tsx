import React from 'react';
import { Users, Clock, Stethoscope, AlertTriangle, Cpu } from 'lucide-react';
import { Cabin, QueueToken } from '@/lib/types';

interface StatsBannerProps {
  cabins: Cabin[];
  queue: QueueToken[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ cabins, queue }) => {
  const activeCabinsCount = cabins.filter((c) => c.status === 'IN_CONSULTATION').length;
  const criticalCount = queue.filter((t) => t.urgency_level === 'CRITICAL').length;

  const totalEstMins = queue.reduce((sum, item) => sum + (item.estimated_mins || 10), 0);
  const avgWaitMins = queue.length > 0 ? Math.round(totalEstMins / Math.max(1, cabins.length)) : 0;

  const metrics = [
    {
      label: 'Waiting in Queue',
      value: queue.length.toString(),
      subtext: 'Sorted by Gemini priority',
      icon: Users,
      color: 'text-[#7C3AED]',
      bg: 'bg-purple-50',
    },
    {
      label: 'Doctor Cabins Active',
      value: `${activeCabinsCount}/${cabins.length}`,
      subtext: 'In active consultations',
      icon: Stethoscope,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Estimated Wait Time',
      value: `${avgWaitMins} min`,
      subtext: 'Predicted via AI heuristics',
      icon: Clock,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Critical / STAT Alerts',
      value: criticalCount.toString(),
      subtext: criticalCount > 0 ? 'Fast-tracked immediately' : 'No emergency flags',
      icon: AlertTriangle,
      color: criticalCount > 0 ? 'text-rose-600' : 'text-slate-500',
      bg: criticalCount > 0 ? 'bg-rose-50' : 'bg-slate-50',
    },
    {
      label: 'AI Clinical Engine',
      value: 'Gemini 2.5',
      subtext: 'Multimodal Flash model',
      icon: Cpu,
      color: 'text-[#7C3AED]',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-purple-100/90 shadow-[0_10px_25px_-5px_rgba(124,58,237,0.06)] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-slate-500 line-clamp-1">{m.label}</span>
              <div className={`w-7 h-7 rounded-lg ${m.bg} ${m.color} flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                {m.value}
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{m.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
