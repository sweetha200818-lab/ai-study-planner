import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ShieldAlert,
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { StudySession, Subject, Exam, StudentProfile } from '../types';
import { apiService, RescheduleResponse } from '../services/api';
import confetti from 'canvas-confetti';

interface RescheduleModalProps {
  missedSessions: StudySession[];
  remainingSessions: StudySession[];
  subjects: Subject[];
  exams: Exam[];
  profile: StudentProfile;
  onClose: () => void;
  onApplyRescheduledSessions: (newSessions: StudySession[]) => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  missedSessions,
  remainingSessions,
  subjects,
  exams,
  profile,
  onClose,
  onApplyRescheduledSessions,
}) => {
  const [dailyHours, setDailyHours] = useState<number>(profile.dailyTargetHours || 2.5);
  const [todayDate, setTodayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rescheduleResult, setRescheduleResult] = useState<RescheduleResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleReschedule = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiService.rescheduleMissed({
        missedSessions,
        remainingSessions,
        subjects,
        exams,
        dailyHours,
        todayDate,
      });

      if (res.success && res.data) {
        setRescheduleResult(res.data);
        confetti({
          particleCount: 50,
          spread: 60,
        });
      } else {
        setErrorMsg(res.error || 'Failed to adjust schedule');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error adjusting schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!rescheduleResult || !rescheduleResult.rescheduledSessions) return;
    onApplyRescheduledSessions(rescheduleResult.rescheduledSessions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                AI Smart Catch-Up & Rescheduler
              </h2>
              <p className="text-xs text-slate-400">
                Automatically balance missed study sessions into future open slots
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!rescheduleResult ? (
            <div className="space-y-4">
              {/* Missed Sessions List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                    Missed Study Blocks ({missedSessions.length})
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {missedSessions.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-300">{m.subjectName}</span>
                        <span className="text-[10px] text-slate-400">Scheduled: {m.scheduledDate}</span>
                      </div>
                      <p className="text-slate-200 font-medium">{m.title}</p>
                      {m.notes && <p className="text-[11px] text-slate-400">{m.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjust Parameters */}
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                <div className="text-xs font-semibold text-slate-200">Adaptive Rebalancing Parameters</div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Today's Date</label>
                    <input
                      type="date"
                      value={todayDate}
                      onChange={(e) => setTodayDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Available Daily Study Hours</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      step={0.5}
                      value={dailyHours}
                      onChange={(e) => setDailyHours(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleReschedule}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 via-indigo-600 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>{isLoading ? 'AI Recalculating Schedule...' : 'Recalculate & Rebalance Schedule'}</span>
              </button>
            </div>
          ) : (
            /* RESCHEDULE PREVIEW */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Adjustment Strategy Applied
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {rescheduleResult.adjustmentStrategy}
                </p>

                {rescheduleResult.catchUpTips && rescheduleResult.catchUpTips.length > 0 && (
                  <ul className="space-y-1 pt-1 text-xs text-emerald-200/90 list-disc list-inside">
                    {rescheduleResult.catchUpTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Updated Sessions preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">
                  Updated Schedule ({rescheduleResult.rescheduledSessions.length} Total Sessions)
                </h4>
                <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-slate-800">
                  {rescheduleResult.rescheduledSessions.map((sess, idx) => (
                    <div key={idx} className="pt-2 text-xs flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-indigo-400">{sess.subjectName}</span>
                          <span className="text-slate-400">📅 {sess.scheduledDate} ({sess.durationMinutes}m)</span>
                        </div>
                        <p className="text-slate-300 font-medium">{sess.title}</p>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        {sess.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {rescheduleResult && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
            <button
              onClick={() => setRescheduleResult(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Back
            </button>

            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Apply Schedule</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
