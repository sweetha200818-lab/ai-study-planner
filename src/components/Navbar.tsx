import React from 'react';
import {
  BookOpen,
  Calendar,
  Flame,
  Clock,
  Sparkles,
  RefreshCw,
  MessageSquareText,
  Bell,
  Plus,
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import { StudentProfile, StudySession } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'timetable' | 'subjects' | 'quiz' | 'analytics';
  setCurrentTab: (tab: 'dashboard' | 'timetable' | 'subjects' | 'quiz' | 'analytics') => void;
  profile: StudentProfile;
  todaySessions: StudySession[];
  missedSessionsCount: number;
  onOpenFocusTimer: () => void;
  onOpenAIPlanModal: () => void;
  onOpenRescheduleModal: () => void;
  onOpenCoachDrawer: () => void;
  onOpenRemindersModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAddSubjectModal: () => void;
  onOpenAddExamModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  profile,
  todaySessions,
  missedSessionsCount,
  onOpenFocusTimer,
  onOpenAIPlanModal,
  onOpenRescheduleModal,
  onOpenCoachDrawer,
  onOpenRemindersModal,
  onOpenProfileModal,
  onOpenAddSubjectModal,
  onOpenAddExamModal,
}) => {
  const completedToday = todaySessions.filter(s => s.status === 'completed').length;
  const totalToday = todaySessions.length;
  const todayProgressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                  StudyAura
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Planner
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Intelligent Adaptive Study & Exam System</p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/70 p-1 rounded-xl border border-slate-700/60">
            <button
              id="tab-dashboard-btn"
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Dashboard
            </button>

            <button
              id="tab-timetable-btn"
              onClick={() => setCurrentTab('timetable')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Timetable
            </button>

            <button
              id="tab-subjects-btn"
              onClick={() => setCurrentTab('subjects')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Subjects & Syllabus
            </button>

            <button
              id="tab-quiz-btn"
              onClick={() => setCurrentTab('quiz')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                currentTab === 'quiz'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Practice & Quizzes
            </button>
          </nav>

          {/* Quick Actions & Stats */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak Counter */}
            <div
              id="streak-indicator-badge"
              title={`${profile.streakCount} Day Study Streak! Keep it going!`}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold"
            >
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{profile.streakCount}d streak</span>
            </div>

            {/* Pomodoro Focus Launcher */}
            <button
              id="pomodoro-timer-launcher-btn"
              onClick={onOpenFocusTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium transition-colors shadow-sm"
              title="Start Pomodoro Focus Session"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Focus Timer</span>
            </button>

            {/* Smart Reschedule Trigger (highlighted if missed sessions) */}
            {missedSessionsCount > 0 && (
              <button
                id="smart-reschedule-alert-btn"
                onClick={onOpenRescheduleModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-medium transition-all animate-bounce"
                title={`${missedSessionsCount} missed session(s). Click to AI rebalance!`}
              >
                <RefreshCw className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Catch-Up ({missedSessionsCount})</span>
              </button>
            )}

            {/* AI Generator Button */}
            <button
              id="ai-generate-plan-header-btn"
              onClick={onOpenAIPlanModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-medium shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span className="hidden lg:inline">AI Study Plan</span>
            </button>

            {/* AI Coach Drawer Toggle */}
            <button
              id="ai-coach-drawer-btn"
              onClick={onOpenCoachDrawer}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
              title="Chat with AI Study Coach"
            >
              <MessageSquareText className="w-4 h-4 text-cyan-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full ring-2 ring-slate-900" />
            </button>

            {/* Reminders Toggle */}
            <button
              id="reminders-settings-btn"
              onClick={onOpenRemindersModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Study Reminders & Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Profile Avatar & Settings */}
            <button
              id="user-profile-avatar-btn"
              onClick={onOpenProfileModal}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Student Profile & Settings"
            >
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-400"
              />
              <span className="text-xs font-medium text-slate-200 hidden xl:inline max-w-[100px] truncate">
                {profile.name}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex flex-col items-center py-1 px-2 ${
              currentTab === 'dashboard' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 mb-0.5" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('timetable')}
            className={`flex flex-col items-center py-1 px-2 ${
              currentTab === 'timetable' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4 mb-0.5" />
            Timetable
          </button>
          <button
            onClick={() => setCurrentTab('subjects')}
            className={`flex flex-col items-center py-1 px-2 ${
              currentTab === 'subjects' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <GraduationCap className="w-4 h-4 mb-0.5" />
            Subjects
          </button>
          <button
            onClick={() => setCurrentTab('quiz')}
            className={`flex flex-col items-center py-1 px-2 ${
              currentTab === 'quiz' ? 'text-amber-300 font-semibold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5" />
            AI Quizzes
          </button>
        </div>
      </div>
    </header>
  );
};
