import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Flame,
  ArrowRight,
  Plus,
  Play,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Target,
  GraduationCap,
  Layers,
  ChevronRight,
  ShieldAlert,
  Award,
  Zap,
  Check,
  Brain
} from 'lucide-react';
import { StudentProfile, Subject, Exam, StudySession, StudyLog } from '../types';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  profile: StudentProfile;
  subjects: Subject[];
  exams: Exam[];
  sessions: StudySession[];
  studyLogs: StudyLog[];
  onStartSession: (session: StudySession) => void;
  onToggleSessionStatus: (sessionId: string, newStatus: 'completed' | 'pending' | 'missed') => void;
  onOpenAIPlanModal: () => void;
  onOpenRescheduleModal: () => void;
  onOpenAddSubjectModal: () => void;
  onOpenAddExamModal: () => void;
  onNavigateToQuiz: (subjectId: string, topicName: string) => void;
  onNavigateTab: (tab: 'timetable' | 'subjects' | 'quiz') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  subjects,
  exams,
  sessions,
  studyLogs,
  onStartSession,
  onToggleSessionStatus,
  onOpenAIPlanModal,
  onOpenRescheduleModal,
  onOpenAddSubjectModal,
  onOpenAddExamModal,
  onNavigateToQuiz,
  onNavigateTab,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's sessions
  const todaySessions = sessions.filter((s) => s.scheduledDate === todayStr);
  const completedToday = todaySessions.filter((s) => s.status === 'completed');
  const missedSessions = sessions.filter((s) => s.status === 'missed');

  // Calculate today's completed study minutes
  const todayStudiedMinutes = completedToday.reduce(
    (acc, s) => acc + (s.completedMinutes || s.durationMinutes),
    0
  );
  const dailyTargetMinutes = Math.round(profile.dailyTargetHours * 60);

  // Overall topics completion
  let totalTopics = 0;
  let completedTopics = 0;
  subjects.forEach((sub) => {
    sub.topics.forEach((top) => {
      totalTopics++;
      if (top.completed) completedTopics++;
    });
  });

  // Calculate days left for exams & sort by urgency
  const sortedExams = [...exams]
    .map((exam) => {
      const examDate = new Date(exam.date);
      const today = new Date(todayStr);
      const diffTime = examDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate subject readiness
      const sub = subjects.find((s) => s.id === exam.subjectId);
      let readiness = 0;
      if (sub && sub.topics.length > 0) {
        const done = sub.topics.filter((t) => t.completed).length;
        readiness = Math.round((done / sub.topics.length) * 100);
      }
      return {
        ...exam,
        daysLeft,
        readiness,
        subjectColor: sub?.color || '#6366F1',
        examMonth: examDate.toLocaleDateString('en-US', { month: 'short' }),
        examDayNumber: examDate.getDate(),
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Flattened topic list for Quick Topic Checklist
  const allTopicsWithSubject = subjects.flatMap((sub) =>
    sub.topics.map((t) => ({ ...t, subjectName: sub.name, subjectColor: sub.color }))
  );

  const handleCheckboxToggle = (topic: any) => {
    const sub = subjects.find((s) => s.id === topic.subjectId);
    if (!sub) return;

    const nextCompleted = !topic.completed;
    if (nextCompleted) {
      confetti({
        particleCount: 35,
        spread: 50,
      });
    }

    const updatedTopics = sub.topics.map((t) =>
      t.id === topic.id ? { ...t, completed: nextCompleted } : t
    );

    // Call update through navigation or state
    // We update topics in place by referencing
    sub.topics = updatedTopics;
  };

  const handleMarkComplete = (sessionId: string) => {
    onToggleSessionStatus(sessionId, 'completed');
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366F1', '#10B981', '#F59E0B', '#38BDF8'],
    });
  };

  return (
    <div className="space-y-6">
      {/* High Density Grid Layout (Matching Design Theme) */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ROW 1 (LEFT): Today's AI Schedule (High Density 8-col card) */}
        <div className="md:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            {/* Card Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                <span className="w-2 h-5 bg-indigo-500 rounded-full inline-block" />
                Today's AI Schedule
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => onNavigateTab('timetable')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  View All &rarr;
                </button>
              </div>
            </div>

            {/* High-Density Session Blocks (4 Columns) */}
            {todaySessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-slate-600">No scheduled sessions for today</p>
                <p className="text-[11px] text-slate-400">
                  Generate a day-by-day plan with our AI generator to automatically populate your blocks.
                </p>
                <button
                  onClick={onOpenAIPlanModal}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  + Generate AI Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {todaySessions.map((session, idx) => {
                  const isDone = session.status === 'completed';
                  const isMissed = session.status === 'missed';
                  const isFirstPending = !isDone && !isMissed && idx === todaySessions.findIndex(s => s.status === 'pending');

                  let containerStyles = 'bg-white border-slate-200';
                  let badgeStyles = 'text-slate-500';
                  let statusText = 'Upcoming';

                  if (isDone) {
                    containerStyles = 'bg-indigo-50/50 border-indigo-100';
                    badgeStyles = 'text-indigo-600';
                    statusText = 'Completed';
                  } else if (isFirstPending) {
                    containerStyles = 'bg-amber-50/50 border-amber-200';
                    badgeStyles = 'text-amber-600';
                    statusText = 'Next Focus';
                  } else if (isMissed) {
                    containerStyles = 'bg-rose-50/50 border-rose-200';
                    badgeStyles = 'text-rose-600';
                    statusText = 'Missed';
                  }

                  return (
                    <div
                      key={session.id}
                      className={`p-3.5 border rounded-xl flex flex-col justify-between relative min-h-[140px] shadow-2xs transition-all hover:shadow-sm ${containerStyles}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeStyles}`}>
                          {session.startTime} ({session.durationMinutes}m)
                        </span>

                        {isDone ? (
                          <span className="text-indigo-600 font-black text-xs">✓</span>
                        ) : isFirstPending ? (
                          <div className="flex space-x-1">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse opacity-50" />
                          </div>
                        ) : null}
                      </div>

                      <div className="font-bold text-xs sm:text-sm text-slate-800 leading-tight mt-1 line-clamp-2">
                        {session.title}
                      </div>

                      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100/80">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {statusText}
                        </span>

                        <div className="flex items-center gap-1">
                          {!isDone && (
                            <button
                              onClick={() => onStartSession(session)}
                              className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                              title="Start Focus Timer"
                            >
                              <Play className="w-3 h-3 fill-emerald-600" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleMarkComplete(session.id)
                            }
                            className={`p-1 rounded text-[10px] ${
                              isDone
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                            title={isDone ? 'Completed' : 'Mark Done'}
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Schedule Adjustment Banner (Adaptive Rescheduling Alert) */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-dashed border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-md border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-2xs">
                🤖
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  {missedSessions.length > 0
                    ? `${missedSessions.length} Missed Study Session(s) Pending`
                    : 'AI Adaptive Rebalance Engine Active'}
                </div>
                <div className="text-[11px] text-slate-500">
                  {missedSessions.length > 0
                    ? 'Automatically balance missed sessions into future open slots without overloading exam days.'
                    : 'Schedule is optimized for spaced recall intervals and peak exam readiness.'}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenRescheduleModal}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-md shrink-0 transition-colors"
            >
              {missedSessions.length > 0 ? 'AI Auto-Reschedule' : 'Rebalance Schedule'}
            </button>
          </div>
        </div>

        {/* ROW 1 (RIGHT): Course Mastery (High Density Dark 4-col card) */}
        <div className="md:col-span-4 bg-slate-900 rounded-2xl shadow-xl p-5 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Course Mastery
              </h2>
              <button
                onClick={() => onNavigateTab('subjects')}
                className="text-[11px] text-indigo-300 hover:text-indigo-200"
              >
                Manage
              </button>
            </div>

            {/* Subject Mastery Progress Bars */}
            <div className="space-y-3.5">
              {subjects.map((sub, idx) => {
                const total = sub.topics.length;
                const done = sub.topics.filter((t) => t.completed).length;
                const percent = total > 0 ? Math.round((done / total) * 100) : 0;

                const barColor =
                  idx === 0
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                    : idx === 1
                    ? 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.4)]'
                    : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]';

                return (
                  <div key={sub.id}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-medium text-slate-200">{sub.name}</span>
                      <span className="font-bold text-white">{percent}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Study Goal 7-Day Matrix */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400 font-medium">Weekly Study Target</div>
              <div className="text-xs font-bold text-white">
                {Math.round(todayStudiedMinutes / 60)} / {profile.dailyTargetHours * 7} hrs
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              <div className="h-3 flex-1 bg-indigo-400 rounded-xs" title="Monday" />
              <div className="h-3 flex-1 bg-indigo-400 rounded-xs" title="Tuesday" />
              <div className="h-3 flex-1 bg-indigo-400 rounded-xs" title="Wednesday" />
              <div className="h-3 flex-1 bg-indigo-400 rounded-xs" title="Thursday" />
              <div className="h-3 flex-1 bg-slate-700 rounded-xs" title="Friday" />
              <div className="h-3 flex-1 bg-slate-700 rounded-xs" title="Saturday" />
              <div className="h-3 flex-1 bg-slate-700 rounded-xs" title="Sunday" />
            </div>
          </div>
        </div>

        {/* ROW 2 (LEFT): Topic Checklist (High Density White 4-col card) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Topic Checklist
              </h2>
              <span className="text-[10px] font-bold text-slate-500">
                {completedTopics}/{totalTopics} Mastered
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {allTopicsWithSubject.slice(0, 5).map((topic) => (
                <div
                  key={topic.id}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    topic.completed ? 'bg-slate-50' : 'bg-white border border-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={topic.completed}
                    onChange={() => handleCheckboxToggle(topic)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="text-xs">
                    <div
                      className={`font-semibold ${
                        topic.completed ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {topic.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {topic.subjectName} • {topic.chapterOrUnit || 'Chapter 1'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onOpenAddSubjectModal}
            className="w-full mt-4 py-2 border-2 border-dashed border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            + ADD TOPIC / CHAPTER
          </button>
        </div>

        {/* ROW 2 (MIDDLE): Upcoming Exams (High Density White 4-col card) */}
        <div className="md:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-600" /> Upcoming Exams
              </h2>
              <button
                onClick={onOpenAddExamModal}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                + Register
              </button>
            </div>

            {sortedExams.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">No exams added yet.</div>
            ) : (
              <div className="space-y-3">
                {sortedExams.slice(0, 3).map((exam, idx) => (
                  <div key={exam.id} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase">{exam.examMonth}</span>
                      <span className="text-sm font-black leading-none">{exam.examDayNumber}</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {exam.title}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter mt-0.5">
                        {exam.subjectName} • {exam.daysLeft} Days Left
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{exams.length} total exam milestones</span>
            <button
              onClick={onOpenAddExamModal}
              className="text-indigo-600 font-bold hover:text-indigo-800 text-[11px]"
            >
              Add Deadline
            </button>
          </div>
        </div>

        {/* ROW 2 (RIGHT): Flash Quiz / Active Recall (High Density Indigo Vibrant 4-col card) */}
        <div className="md:col-span-4 bg-indigo-600 rounded-2xl shadow-lg p-5 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🧠</span>
              <h2 className="font-bold text-sm text-white">Flash Quiz Arena</h2>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed italic mb-4">
              "The AI has generated active recall questions based on your study history to reinforce long-term exam retention."
            </p>
          </div>

          <div className="space-y-2 mt-auto">
            <button
              onClick={() => onNavigateTab('quiz')}
              className="w-full bg-white hover:bg-slate-50 text-indigo-700 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-[1.01]"
            >
              START RECALL SESSION
            </button>
            <button
              onClick={() => onNavigateTab('quiz')}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-1.5 rounded-xl font-bold text-[11px] border border-white/20 transition-colors"
            >
              Review Spaced Flashcards
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
