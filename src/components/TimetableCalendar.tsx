import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Sparkles,
  RefreshCw,
  Plus,
  Filter,
  Layers,
  BookOpen,
  CalendarCheck,
  Zap,
  Check
} from 'lucide-react';
import { StudySession, Subject, StudentProfile } from '../types';

interface TimetableCalendarProps {
  sessions: StudySession[];
  subjects: Subject[];
  profile: StudentProfile;
  onStartSession: (session: StudySession) => void;
  onToggleSessionStatus: (sessionId: string, newStatus: 'completed' | 'pending' | 'missed') => void;
  onOpenAIPlanModal: () => void;
  onOpenRescheduleModal: () => void;
  onAddCustomSession: (session: Partial<StudySession>) => void;
}

export const TimetableCalendar: React.FC<TimetableCalendarProps> = ({
  sessions,
  subjects,
  profile,
  onStartSession,
  onToggleSessionStatus,
  onOpenAIPlanModal,
  onOpenRescheduleModal,
  onAddCustomSession,
}) => {
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'week' | 'agenda'>('week');

  // Quick Add Modal state
  const [isAddingSession, setIsAddingSession] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('16:00');
  const [newDuration, setNewDuration] = useState(60);
  const [newType, setNewType] = useState<'deep_work' | 'revision' | 'practice_quiz' | 'flashcards' | 'mock_exam'>('deep_work');
  const [newNotes, setNewNotes] = useState('');

  // Calculate dates for current week view
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + currentWeekOffset * 7);
  // Find Monday of this week
  const dayOfWeek = baseDate.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(baseDate);
  monday.setDate(monday.getDate() - diffToMonday);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    return {
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday,
    };
  });

  const filteredSessions = sessions.filter((s) => {
    if (selectedSubjectFilter !== 'all' && s.subjectId !== selectedSubjectFilter) {
      return false;
    }
    return true;
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubjectId) return;

    const sub = subjects.find((s) => s.id === newSubjectId);
    onAddCustomSession({
      id: `custom-sess-${Date.now()}`,
      subjectId: newSubjectId,
      subjectName: sub?.name || 'Custom Subject',
      title: newTitle.trim(),
      scheduledDate: newDate,
      startTime: newStartTime,
      durationMinutes: Number(newDuration) || 45,
      type: newType,
      status: 'pending',
      notes: newNotes.trim(),
    });

    setIsAddingSession(false);
    setNewTitle('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* High Density Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Study Timetable</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              AI Adaptive Schedule
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organized daily study blocks, spaced recall drills, and pre-exam revisions
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <div className="relative">
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="all">All Subjects ({subjects.length})</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center gap-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'week' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'agenda' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline Agenda
            </button>
          </div>

          {/* Quick Add Custom Session */}
          <button
            onClick={() => setIsAddingSession(true)}
            className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Session</span>
          </button>

          {/* Generate Plan button */}
          <button
            onClick={onOpenAIPlanModal}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            <span>AI Plan Generator</span>
          </button>
        </div>
      </div>

      {/* Week Navigator */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm font-bold text-slate-900">
            {weekDays[0].monthName} {weekDays[0].dayNumber} - {weekDays[6].monthName} {weekDays[6].dayNumber}
          </span>

          <button
            onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
            className="p-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {currentWeekOffset !== 0 && (
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold ml-2"
            >
              Today's Week
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-4 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Missed
          </span>
        </div>
      </div>

      {/* VIEW MODE 1: 7-Day Grid View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const daySessions = filteredSessions.filter((s) => s.scheduledDate === day.dateStr);
            const totalMins = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

            return (
              <div
                key={day.dateStr}
                className={`rounded-2xl border flex flex-col min-h-[360px] shadow-xs transition-all ${
                  day.isToday
                    ? 'bg-white border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Day Column Header */}
                <div
                  className={`p-3 border-b rounded-t-2xl flex items-center justify-between ${
                    day.isToday ? 'bg-indigo-50/70 border-indigo-100' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider block ${
                        day.isToday ? 'text-indigo-700' : 'text-slate-500'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className={`text-base font-extrabold ${day.isToday ? 'text-indigo-900' : 'text-slate-800'}`}>
                      {day.monthName} {day.dayNumber}
                    </span>
                  </div>

                  {totalMins > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                      {totalMins}m
                    </span>
                  )}
                </div>

                {/* Day Sessions List */}
                <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[480px]">
                  {daySessions.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-center text-slate-400 text-xs px-2">
                      <p>Rest day / open</p>
                    </div>
                  ) : (
                    daySessions.map((session) => {
                      const sub = subjects.find((s) => s.id === session.subjectId);
                      const isDone = session.status === 'completed';
                      const isMissed = session.status === 'missed';

                      return (
                        <div
                          key={session.id}
                          className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                            isDone
                              ? 'bg-slate-50 border-slate-200 opacity-70'
                              : isMissed
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded text-white truncate max-w-[100px]"
                              style={{ backgroundColor: sub?.color || '#6366F1' }}
                            >
                              {session.subjectName}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold">{session.startTime}</span>
                          </div>

                          <h4 className={`font-bold mt-1 text-xs line-clamp-2 ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                            {session.title}
                          </h4>

                          <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 text-[10px] text-slate-500">
                            <span>{session.durationMinutes}m</span>

                            <div className="flex items-center gap-1">
                              {!isDone && (
                                <button
                                  onClick={() => onStartSession(session)}
                                  className="p-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                                  title="Start Focus Timer"
                                >
                                  <Play className="w-3 h-3 fill-emerald-600" />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  onToggleSessionStatus(session.id, isDone ? 'pending' : 'completed')
                                }
                                className={`p-1 rounded ${
                                  isDone
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 hover:bg-indigo-600 text-slate-600 hover:text-white'
                                }`}
                                title={isDone ? 'Mark Pending' : 'Mark Completed'}
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: Chronological Agenda Timeline View */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {filteredSessions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <CalendarIcon className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No scheduled study sessions</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Generate an intelligent schedule with our AI generator to automatically populate your study plan.
              </p>
              <button
                onClick={onOpenAIPlanModal}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                + Generate AI Plan
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              {filteredSessions
                .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate) || a.startTime.localeCompare(b.startTime))
                .map((session) => {
                  const sub = subjects.find((s) => s.id === session.subjectId);
                  const isDone = session.status === 'completed';
                  const isMissed = session.status === 'missed';

                  return (
                    <div
                      key={session.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                        isDone ? 'bg-slate-50/70 opacity-70' : isMissed ? 'bg-rose-50/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => onToggleSessionStatus(session.id, isDone ? 'pending' : 'completed')}
                          className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'border-slate-300 hover:border-indigo-500 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                              style={{ backgroundColor: sub?.color || '#6366F1' }}
                            >
                              {session.subjectName}
                            </span>

                            <span className="text-xs font-bold text-slate-700">
                              📅 {new Date(session.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {session.startTime}
                            </span>

                            <span className="text-xs text-slate-500">({session.durationMinutes} mins)</span>
                          </div>

                          <h3 className={`text-sm sm:text-base font-bold mt-1 ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {session.title}
                          </h3>

                          {session.notes && (
                            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{session.notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {!isDone && (
                          <button
                            onClick={() => onStartSession(session)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-emerald-600" />
                            <span>Start Focus</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            onToggleSessionStatus(session.id, isMissed ? 'pending' : 'missed')
                          }
                          className={`p-1.5 rounded-lg text-xs ${
                            isMissed
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-100 text-slate-500 hover:text-rose-600'
                          }`}
                          title="Mark as Missed"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Custom Session Modal */}
      {isAddingSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Study Session Block</h3>
              <button
                onClick={() => setIsAddingSession(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Study: Multivariable Integrals"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Session Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="deep_work">Deep Work Sprint</option>
                    <option value="revision">Concept Revision</option>
                    <option value="practice_quiz">Practice Quiz</option>
                    <option value="flashcards">Flashcards</option>
                    <option value="mock_exam">Mock Exam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts to memorize, textbook problem numbers..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSession(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs"
                >
                  Save Study Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
