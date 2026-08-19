import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  Zap,
  BookOpen,
  GraduationCap,
  Layers,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Subject, Exam, StudySession, StudentProfile } from '../types';
import { apiService, PlanGenerationResponse } from '../services/api';
import confetti from 'canvas-confetti';

interface AIPlanGeneratorModalProps {
  subjects: Subject[];
  exams: Exam[];
  profile: StudentProfile;
  onClose: () => void;
  onApplyPlan: (newSessions: StudySession[]) => void;
}

export const AIPlanGeneratorModal: React.FC<AIPlanGeneratorModalProps> = ({
  subjects,
  exams,
  profile,
  onClose,
  onApplyPlan,
}) => {
  const [dailyHours, setDailyHours] = useState<number>(profile.dailyTargetHours || 2.5);
  const [studyDaysCount, setStudyDaysCount] = useState<number>(14);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [learningStyle, setLearningStyle] = useState<string>(profile.learningStyle || 'Active Recall & Practice Heavy');
  const [preferences, setPreferences] = useState<string>('Prioritize high-difficulty topics and subjects with exams in the next 2-3 weeks.');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<PlanGenerationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await apiService.generatePlan({
        subjects,
        exams,
        dailyHours,
        startDate,
        studyDaysCount,
        learningStyle,
        preferences,
      });

      if (res.success && res.data) {
        setGeneratedPlan(res.data);
        confetti({
          particleCount: 50,
          spread: 70,
        });
      } else {
        setErrorMsg(res.error || 'Failed to generate study timetable');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with AI server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedPlan || !generatedPlan.sessions) return;
    onApplyPlan(generatedPlan.sessions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                AI Study Timetable Generator
              </h2>
              <p className="text-xs text-slate-400">
                Custom algorithmic schedule balancing spaced repetition & exam readiness
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

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!generatedPlan ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Daily hours slider */}
              <div className="space-y-2 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" /> Daily Available Study Time:
                  </span>
                  <span className="text-base font-bold text-indigo-300">{dailyHours} hours / day</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>30 mins (Light)</span>
                  <span>2.5 hrs (Standard)</span>
                  <span>5+ hrs (Exam Bootcamp)</span>
                </div>
              </div>

              {/* Timeframe & Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Plan Duration (Days)
                  </label>
                  <select
                    value={studyDaysCount}
                    onChange={(e) => setStudyDaysCount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={7}>7 Days (Weekly Sprint)</option>
                    <option value={14}>14 Days (2-Week Mastery)</option>
                    <option value={21}>21 Days (3-Week Intensive)</option>
                    <option value={30}>30 Days (Full Month Prep)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Learning Style Preference */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Learning Strategy & Balance
                </label>
                <select
                  value={learningStyle}
                  onChange={(e) => setLearningStyle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active Recall & Practice Heavy">
                    Active Recall & Practice Heavy (Quizzes + Flashcards interspersed)
                  </option>
                  <option value="Balanced with Spaced Repetition">
                    Balanced with Spaced Repetition (Alternating deep study & revision)
                  </option>
                  <option value="Sprint & Review">
                    Sprint & Review (Rapid topic completion followed by mock exams)
                  </option>
                  <option value="Deep Work Focus">
                    Deep Work Focus (Extended single-subject blocks for difficult topics)
                  </option>
                </select>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Custom Notes / Weak Areas to Focus On
                </label>
                <textarea
                  rows={2}
                  value={preferences}
                  onChange={(e) => setPreferences(e.target.value)}
                  placeholder="e.g. Need extra practice in Multivariable Calculus before the 18th..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Subject & Exam Summary Chip */}
              <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-center justify-between">
                <span>
                  Targeting <strong>{subjects.length} subjects</strong> ({subjects.reduce((a, s) => a + s.topics.length, 0)} topics) and <strong>{exams.length} upcoming exams</strong>.
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>{isLoading ? 'AI Analyzing Subjects & Building Plan...' : 'Generate AI Study Schedule'}</span>
              </button>
            </form>
          ) : (
            /* PREVIEW GENERATED PLAN */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  AI Study Strategy Summary
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {generatedPlan.summary}
                </p>
                {generatedPlan.keyHighlights && generatedPlan.keyHighlights.length > 0 && (
                  <ul className="space-y-1 pt-1 text-xs text-slate-300 list-disc list-inside">
                    {generatedPlan.keyHighlights.map((hl, i) => (
                      <li key={i}>{hl}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Sessions preview list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">
                  Generated Schedule ({generatedPlan.sessions.length} Study Blocks)
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800">
                  {generatedPlan.sessions.map((sess, idx) => (
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

        {/* Modal Footer */}
        {generatedPlan && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900">
            <button
              onClick={() => setGeneratedPlan(null)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Back to Settings
            </button>

            <button
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Schedule to Timetable</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
