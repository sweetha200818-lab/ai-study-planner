import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Sparkles,
  RefreshCw,
  Clock,
  Flame,
  CheckCircle2,
  GraduationCap,
  Bell,
  MessageSquareText,
  Plus,
  BarChart3,
  Layers,
  Settings,
  Brain,
  Zap,
  RotateCcw,
  User,
  ShieldCheck,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import {
  Subject,
  Exam,
  StudySession,
  StudentProfile,
  StudyLog,
  Quiz,
  ReminderSetting,
} from './types';
import {
  initialProfile,
  initialSubjects,
  initialExams,
  initialSessions,
  initialStudyLogs,
  initialQuizzes,
  initialReminders,
} from './data/initialData';

import { DashboardView } from './components/DashboardView';
import { TimetableCalendar } from './components/TimetableCalendar';
import { SubjectsManager } from './components/SubjectsManager';
import { QuizArena } from './components/QuizArena';
import { FocusTimerModal } from './components/FocusTimerModal';
import { AIPlanGeneratorModal } from './components/AIPlanGeneratorModal';
import { RescheduleModal } from './components/RescheduleModal';
import { AddSubjectModal } from './components/AddSubjectModal';
import { AddExamModal } from './components/AddExamModal';
import { RemindersSettingsModal } from './components/RemindersSettingsModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AiStudyCoachDrawer } from './components/AiStudyCoachDrawer';
import { soundEngine } from './utils/soundEffects';
import confetti from 'canvas-confetti';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'timetable' | 'subjects' | 'quiz' | 'analytics'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Application Data State (with localStorage persistence fallback)
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('study_aura_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('study_aura_subjects');
    return saved ? JSON.parse(saved) : initialSubjects;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('study_aura_exams');
    return saved ? JSON.parse(saved) : initialExams;
  });

  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study_aura_sessions');
    return saved ? JSON.parse(saved) : initialSessions;
  });

  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(() => {
    const saved = localStorage.getItem('study_aura_logs');
    return saved ? JSON.parse(saved) : initialStudyLogs;
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('study_aura_quizzes');
    return saved ? JSON.parse(saved) : initialQuizzes;
  });

  const [reminders, setReminders] = useState<ReminderSetting[]>(() => {
    const saved = localStorage.getItem('study_aura_reminders');
    return saved ? JSON.parse(saved) : initialReminders;
  });

  // Modal & Drawer State
  const [activeFocusSession, setActiveFocusSession] = useState<StudySession | null>(null);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isAIPlanModalOpen, setIsAIPlanModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState(false);

  // Quiz pre-selection state
  const [quizPreselectSubjectId, setQuizPreselectSubjectId] = useState<string | undefined>(undefined);
  const [quizPreselectTopicName, setQuizPreselectTopicName] = useState<string | undefined>(undefined);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('study_aura_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('study_aura_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('study_aura_exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('study_aura_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study_aura_logs', JSON.stringify(studyLogs));
  }, [studyLogs]);

  useEffect(() => {
    localStorage.setItem('study_aura_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('study_aura_reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Derived state
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter((s) => s.scheduledDate === todayStr);
  const missedSessions = sessions.filter((s) => s.status === 'missed');
  const completedToday = todaySessions.filter((s) => s.status === 'completed');

  // Find next upcoming exam
  const sortedExams = [...exams]
    .map((e) => {
      const examDate = new Date(e.date);
      const today = new Date(todayStr);
      const diffTime = examDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return { ...e, daysLeft };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nextExam = sortedExams.length > 0 ? sortedExams[0] : null;

  // Handlers
  const handleToggleSessionStatus = (sessionId: string, newStatus: 'completed' | 'pending' | 'missed') => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          const isDone = newStatus === 'completed';
          if (isDone) {
            soundEngine.playSuccessChord();
            // Award XP
            setProfile((p) => ({
              ...p,
              xp: p.xp + 50,
              level: Math.floor((p.xp + 50) / 500) + 1,
            }));
          }
          return {
            ...s,
            status: newStatus,
            completedMinutes: isDone ? s.durationMinutes : undefined,
          };
        }
        return s;
      })
    );
  };

  const handleStartFocusTimer = (session: StudySession) => {
    setActiveFocusSession(session);
    setIsFocusTimerOpen(true);
  };

  const handleFocusTimerComplete = (session: StudySession | null, minutesStudied: number, notes: string) => {
    if (session) {
      handleToggleSessionStatus(session.id, 'completed');
    }

    // Log study session
    const newLog: StudyLog = {
      id: `log-${Date.now()}`,
      date: todayStr,
      subjectId: session?.subjectId || subjects[0]?.id || 'general',
      subjectName: session?.subjectName || 'Focused Study',
      minutes: minutesStudied,
      topicsCovered: session ? [session.title] : ['General Study Session'],
      notes,
    };

    setStudyLogs((prev) => [...prev, newLog]);

    // Update profile
    setProfile((prev) => ({
      ...prev,
      totalStudyMinutes: prev.totalStudyMinutes + minutesStudied,
      streakCount: prev.streakCount + (prev.streakCount === 0 ? 1 : 0),
      xp: prev.xp + Math.round(minutesStudied * 2),
      level: Math.floor((prev.xp + Math.round(minutesStudied * 2)) / 500) + 1,
    }));

    setIsFocusTimerOpen(false);
  };

  const handleApplyAIPlan = (newSessions: StudySession[]) => {
    // Merge or replace upcoming pending sessions with new AI schedule
    setSessions(newSessions);
    soundEngine.playSuccessChord();
    confetti({
      particleCount: 70,
      spread: 80,
    });
  };

  const handleApplyRescheduled = (rescheduledSessions: StudySession[]) => {
    setSessions(rescheduledSessions);
    soundEngine.playSuccessChord();
    confetti({
      particleCount: 60,
      spread: 70,
    });
  };

  const handleAddSubject = (newSubject: Subject) => {
    setSubjects((prev) => [...prev, newSubject]);
    soundEngine.playSuccessChord();
  };

  const handleUpdateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    setSessions((prev) => prev.filter((s) => s.subjectId !== subjectId));
  };

  const handleAddExam = (newExam: Exam) => {
    setExams((prev) => [...prev, newExam]);
    soundEngine.playSuccessChord();
  };

  const handleAddCustomSession = (partialSession: Partial<StudySession>) => {
    const fullSession: StudySession = {
      id: partialSession.id || `sess-${Date.now()}`,
      subjectId: partialSession.subjectId || subjects[0]?.id || '',
      subjectName: partialSession.subjectName || 'General Study',
      title: partialSession.title || 'Study Session',
      scheduledDate: partialSession.scheduledDate || todayStr,
      startTime: partialSession.startTime || '16:00',
      durationMinutes: partialSession.durationMinutes || 60,
      type: partialSession.type || 'deep_work',
      status: 'pending',
      notes: partialSession.notes,
    };
    setSessions((prev) => [...prev, fullSession]);
    soundEngine.playChime(659.25);
  };

  const handleNavigateToQuiz = (subjectId: string, topicName: string) => {
    setQuizPreselectSubjectId(subjectId);
    setQuizPreselectTopicName(topicName);
    setCurrentTab('quiz');
  };

  const handleSaveQuizResult = (completedQuiz: Quiz) => {
    setQuizzes((prev) => [completedQuiz, ...prev.filter((q) => q.id !== completedQuiz.id)]);
    // Award XP
    setProfile((p) => ({
      ...p,
      xp: p.xp + (completedQuiz.score || 50),
      level: Math.floor((p.xp + (completedQuiz.score || 50)) / 500) + 1,
    }));
  };

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden">
      {/* High Density Dark Sidebar (Desktop) */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col shrink-0 border-r border-slate-800 hidden md:flex">
        {/* Brand Logo Header */}
        <div className="p-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl italic text-white shadow-md shadow-indigo-500/30">
            A
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-tight">
              LearnFlow AI
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Study Planner
            </span>
          </div>
        </div>

        {/* High Density Nav Items */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          <button
            id="sidebar-dashboard-btn"
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Dashboard</span>
          </button>

          <button
            id="sidebar-timetable-btn"
            onClick={() => setCurrentTab('timetable')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
              currentTab === 'timetable'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Study Schedule</span>
          </button>

          <button
            id="sidebar-subjects-btn"
            onClick={() => setCurrentTab('subjects')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
              currentTab === 'subjects'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Subjects & Syllabus</span>
          </button>

          <button
            id="sidebar-quiz-btn"
            onClick={() => setCurrentTab('quiz')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
              currentTab === 'quiz'
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Practice Quizzes</span>
          </button>

          {/* Quick Action Shortcut in Nav */}
          <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1">
            <div className="text-[10px] uppercase text-slate-500 font-bold px-3 mb-2 tracking-wider">
              Quick Sprints
            </div>

            <button
              onClick={() => setIsFocusTimerOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 transition-colors"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Pomodoro Timer</span>
            </button>

            <button
              onClick={() => setIsCoachDrawerOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-cyan-300 hover:bg-cyan-500/10 transition-colors"
            >
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>AI Study Coach</span>
            </button>

            <button
              onClick={() => setIsRemindersModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span>Study Reminders</span>
            </button>
          </div>
        </nav>

        {/* High Density Bottom Stats & Level Card */}
        <div className="p-4 m-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase text-slate-400 font-bold tracking-wider">
            <span>Daily Goal</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" /> {profile.streakCount}d Streak
            </span>
          </div>

          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (completedToday.length / Math.max(todaySessions.length, 1)) * 100
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {completedToday.length} of {todaySessions.length} done
            </span>
            <span className="text-indigo-300 font-semibold">Level {profile.level}</span>
          </div>
        </div>
      </aside>

      {/* Main App Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* High Density Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20">
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight capitalize">
              {currentTab === 'dashboard'
                ? 'Overview & Schedule'
                : currentTab === 'timetable'
                ? 'Study Schedule'
                : currentTab === 'subjects'
                ? 'Subjects & Syllabus'
                : 'AI Practice & Quizzes'}
            </h1>

            {/* Next Exam Pill Badge */}
            {nextExam && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 uppercase tracking-tighter shadow-xs">
                  Next Exam: {nextExam.title} • {nextExam.daysLeft} Days Left
                </span>
              </div>
            )}
          </div>

          {/* Header Action Buttons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Missed sessions catch-up alert */}
            {missedSessions.length > 0 && (
              <button
                onClick={() => setIsRescheduleModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold transition-all hover:bg-rose-100 animate-pulse"
                title="AI Auto-Reschedule Missed Sessions"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Catch-Up ({missedSessions.length})</span>
              </button>
            )}

            {/* AI Generator Button */}
            <button
              onClick={() => setIsAIPlanModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="hidden lg:inline">AI Generator</span>
            </button>

            {/* Focus Timer Button */}
            <button
              onClick={() => {
                setActiveFocusSession(todaySessions[0] || null);
                setIsFocusTimerOpen(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Launch Pomodoro Focus Timer"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Focus Timer</span>
            </button>

            {/* Coach Drawer Trigger */}
            <button
              onClick={() => setIsCoachDrawerOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative"
              title="Chat with AI Study Coach"
            >
              <Brain className="w-4 h-4 text-indigo-600" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>

            {/* Reminders Button */}
            <button
              onClick={() => setIsRemindersModalOpen(true)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Study Reminders & Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2.5 pl-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{profile.name}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  {profile.gradeLevel}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white ring-2 ring-indigo-500/20 overflow-hidden shrink-0 flex items-center justify-center font-bold text-indigo-700 text-xs">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0F172A] text-white p-4 space-y-2 border-b border-slate-800">
            <button
              onClick={() => {
                setCurrentTab('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Overview
            </button>
            <button
              onClick={() => {
                setCurrentTab('timetable');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-indigo-400" /> Study Schedule
            </button>
            <button
              onClick={() => {
                setCurrentTab('subjects');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" /> Subjects & Syllabus
            </button>
            <button
              onClick={() => {
                setCurrentTab('quiz');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left p-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Quizzes & Flashcards
            </button>
          </div>
        )}

        {/* Scrollable Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                profile={profile}
                subjects={subjects}
                exams={exams}
                sessions={sessions}
                studyLogs={studyLogs}
                onStartSession={handleStartFocusTimer}
                onToggleSessionStatus={handleToggleSessionStatus}
                onOpenAIPlanModal={() => setIsAIPlanModalOpen(true)}
                onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
                onOpenAddSubjectModal={() => setIsAddSubjectModalOpen(true)}
                onOpenAddExamModal={() => setIsAddExamModalOpen(true)}
                onNavigateToQuiz={handleNavigateToQuiz}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'timetable' && (
              <TimetableCalendar
                sessions={sessions}
                subjects={subjects}
                profile={profile}
                onStartSession={handleStartFocusTimer}
                onToggleSessionStatus={handleToggleSessionStatus}
                onOpenAIPlanModal={() => setIsAIPlanModalOpen(true)}
                onOpenRescheduleModal={() => setIsRescheduleModalOpen(true)}
                onAddCustomSession={handleAddCustomSession}
              />
            )}

            {currentTab === 'subjects' && (
              <SubjectsManager
                subjects={subjects}
                onAddSubject={handleAddSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
                onOpenAddSubjectModal={() => setIsAddSubjectModalOpen(true)}
                onNavigateToQuiz={handleNavigateToQuiz}
              />
            )}

            {currentTab === 'quiz' && (
              <QuizArena
                subjects={subjects}
                quizzes={quizzes}
                preselectedSubjectId={quizPreselectSubjectId}
                preselectedTopicName={quizPreselectTopicName}
                onSaveQuizResult={handleSaveQuizResult}
              />
            )}
          </div>
        </div>
      </main>

      {/* Global Interactive Modals */}
      {isFocusTimerOpen && (
        <FocusTimerModal
          session={activeFocusSession}
          onClose={() => setIsFocusTimerOpen(false)}
          onSessionComplete={handleFocusTimerComplete}
        />
      )}

      {isAIPlanModalOpen && (
        <AIPlanGeneratorModal
          subjects={subjects}
          exams={exams}
          profile={profile}
          onClose={() => setIsAIPlanModalOpen(false)}
          onApplyPlan={handleApplyAIPlan}
        />
      )}

      {isRescheduleModalOpen && (
        <RescheduleModal
          missedSessions={missedSessions}
          remainingSessions={sessions.filter((s) => s.status !== 'completed')}
          subjects={subjects}
          exams={exams}
          profile={profile}
          onClose={() => setIsRescheduleModalOpen(false)}
          onApplyRescheduledSessions={handleApplyRescheduled}
        />
      )}

      {isAddSubjectModalOpen && (
        <AddSubjectModal
          onClose={() => setIsAddSubjectModalOpen(false)}
          onAddSubject={handleAddSubject}
        />
      )}

      {isAddExamModalOpen && (
        <AddExamModal
          subjects={subjects}
          onClose={() => setIsAddExamModalOpen(false)}
          onAddExam={handleAddExam}
        />
      )}

      {isRemindersModalOpen && (
        <RemindersSettingsModal
          reminders={reminders}
          onClose={() => setIsRemindersModalOpen(false)}
          onUpdateReminders={setReminders}
        />
      )}

      {isProfileModalOpen && (
        <UserProfileModal
          profile={profile}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateProfile={setProfile}
        />
      )}

      {/* AI Study Coach Drawer */}
      <AiStudyCoachDrawer
        isOpen={isCoachDrawerOpen}
        onClose={() => setIsCoachDrawerOpen(false)}
        profile={profile}
        subjects={subjects}
        exams={exams}
        sessions={sessions}
      />
    </div>
  );
}
