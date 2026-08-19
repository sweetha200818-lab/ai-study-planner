import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Clock,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { Subject, Topic, DifficultyLevel } from '../types';
import { apiService } from '../services/api';
import confetti from 'canvas-confetti';

interface SubjectsManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onOpenAddSubjectModal: () => void;
  onNavigateToQuiz: (subjectId: string, topicName: string) => void;
}

export const SubjectsManager: React.FC<SubjectsManagerProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onOpenAddSubjectModal,
  onNavigateToQuiz,
}) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);
  const [isSuggestingForId, setIsSuggestingForId] = useState<string | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  // New topic quick form state
  const [addingTopicForSubId, setAddingTopicForSubId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicChapter, setNewTopicChapter] = useState('');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<DifficultyLevel>('medium');
  const [newTopicMinutes, setNewTopicMinutes] = useState(90);

  const toggleExpand = (subId: string) => {
    setExpandedSubjectId((prev) => (prev === subId ? null : subId));
  };

  const handleToggleTopicComplete = (subject: Subject, topicId: string) => {
    const updatedTopics = subject.topics.map((top) => {
      if (top.id === topicId) {
        const nextState = !top.completed;
        if (nextState) {
          confetti({
            particleCount: 40,
            spread: 50,
            origin: { y: 0.7 },
          });
        }
        return {
          ...top,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
          masteryScore: nextState ? Math.max(top.masteryScore || 0, 85) : top.masteryScore,
        };
      }
      return top;
    });

    onUpdateSubject({
      ...subject,
      topics: updatedTopics,
    });
  };

  const handleAddTopicSubmit = (subject: Subject, e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const newTopic: Topic = {
      id: `top-${Date.now()}`,
      subjectId: subject.id,
      name: newTopicName.trim(),
      chapterOrUnit: newTopicChapter.trim() || `Chapter ${subject.topics.length + 1}`,
      difficulty: newTopicDifficulty,
      estimatedMinutes: Number(newTopicMinutes) || 60,
      completed: false,
      masteryScore: 0,
    };

    onUpdateSubject({
      ...subject,
      topics: [...subject.topics, newTopic],
    });

    setAddingTopicForSubId(null);
    setNewTopicName('');
    setNewTopicChapter('');
  };

  const handleDeleteTopic = (subject: Subject, topicId: string) => {
    onUpdateSubject({
      ...subject,
      topics: subject.topics.filter((t) => t.id !== topicId),
    });
  };

  // Trigger Gemini to auto-suggest syllabus breakdown
  const handleAISuggestTopics = async (subject: Subject) => {
    setIsSuggestingForId(subject.id);
    setIsLoadingSuggestion(true);

    try {
      const res = await apiService.suggestTopics({
        subjectName: subject.name,
        gradeLevel: 'College / High School',
      });

      if (res.success && res.data && res.data.topics) {
        const generatedTopics: Topic[] = res.data.topics.map((t: any, idx: number) => ({
          id: `top-ai-${Date.now()}-${idx}`,
          subjectId: subject.id,
          name: t.name,
          chapterOrUnit: t.chapterOrUnit || `Unit ${idx + 1}`,
          difficulty: t.difficulty || 'medium',
          estimatedMinutes: t.estimatedMinutes || 90,
          completed: false,
          masteryScore: 0,
          keyConcepts: t.keyConcepts,
          notes: t.notes,
        }));

        onUpdateSubject({
          ...subject,
          topics: [...subject.topics, ...generatedTopics],
        });

        confetti({
          particleCount: 50,
          spread: 70,
        });
      }
    } catch (err) {
      console.error('Failed to suggest topics', err);
    } finally {
      setIsLoadingSuggestion(false);
      setIsSuggestingForId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Courses & Syllabus Units</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {subjects.length} Subjects Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Break down courses into chapters, track completion percentages, and generate AI practice sets
          </p>
        </div>

        <button
          onClick={onOpenAddSubjectModal}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">No subjects registered yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your courses (e.g. Mathematics, Physics, Organic Chemistry) to build an intelligent study schedule.
          </p>
          <button
            onClick={onOpenAddSubjectModal}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            + Create First Subject
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {subjects.map((subject) => {
            const isExpanded = expandedSubjectId === subject.id;
            const totalTopics = subject.topics.length;
            const completedTopics = subject.topics.filter((t) => t.completed).length;
            const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
            const totalEstMinutes = subject.topics.reduce((acc, t) => acc + t.estimatedMinutes, 0);

            return (
              <div
                key={subject.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                {/* Subject Accordion Header */}
                <div
                  onClick={() => toggleExpand(subject.id)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className="w-3 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color }}
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {subject.code || 'COURSE'}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                          {subject.name}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            subject.difficulty === 'critical'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : subject.difficulty === 'hard'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {subject.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>{totalTopics} chapters / units</span>
                        <span>•</span>
                        <span>{Math.round(totalEstMinutes / 60)}h estimated study time</span>
                        {subject.targetGrade && (
                          <>
                            <span>•</span>
                            <span>Target: <strong className="text-indigo-600">{subject.targetGrade}</strong></span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-800">
                        {completedTopics}/{totalTopics} ({progressPercent}%)
                      </div>
                      <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${progressPercent}%`,
                            backgroundColor: subject.color,
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content: Topics Breakdown */}
                {isExpanded && (
                  <div className="p-5 bg-slate-50/60 space-y-4">
                    {/* Controls Bar for this Subject */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                      <div className="text-xs font-bold text-slate-700">
                        Syllabus Units ({subject.topics.length})
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* AI Suggest Topics Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAISuggestTopics(subject);
                          }}
                          disabled={isLoadingSuggestion && isSuggestingForId === subject.id}
                          className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>
                            {isLoadingSuggestion && isSuggestingForId === subject.id
                              ? 'AI Generating Syllabus...'
                              : 'AI Auto-Suggest Chapters'}
                          </span>
                        </button>

                        {/* Add Topic Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingTopicForSubId(subject.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic</span>
                        </button>

                        {/* Generate AI Quiz Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateToQuiz(subject.id, subject.topics[0]?.name || 'Fundamentals');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Generate Quiz</span>
                        </button>

                        {/* Delete Subject Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete ${subject.name}?`)) {
                              onDeleteSubject(subject.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add Topic Form Drawer (if open) */}
                    {addingTopicForSubId === subject.id && (
                      <form
                        onSubmit={(e) => handleAddTopicSubmit(subject, e)}
                        className="bg-white border border-indigo-200 rounded-xl p-4 space-y-3 shadow-sm"
                      >
                        <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" />
                          Add Topic to {subject.name}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <input
                              type="text"
                              required
                              placeholder="Topic Name (e.g. Eigenvectors & Diagonalization)"
                              value={newTopicName}
                              onChange={(e) => setNewTopicName(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="Chapter/Unit (e.g. Chapter 5)"
                              value={newTopicChapter}
                              onChange={(e) => setNewTopicChapter(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">Difficulty</label>
                            <select
                              value={newTopicDifficulty}
                              onChange={(e: any) => setNewTopicDifficulty(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                              <option value="critical">Critical</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-500 mb-1">Est. Study Minutes</label>
                            <input
                              type="number"
                              min={15}
                              max={300}
                              step={15}
                              value={newTopicMinutes}
                              onChange={(e) => setNewTopicMinutes(Number(e.target.value))}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800"
                            />
                          </div>

                          <div className="col-span-2 sm:col-span-1 flex items-end justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setAddingTopicForSubId(null)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Topics Checklist */}
                    {subject.topics.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        No topics defined yet. Click "AI Auto-Suggest Chapters" above to generate a full syllabus!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {subject.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                              topic.completed
                                ? 'bg-slate-100/60 border-slate-200 opacity-70'
                                : 'bg-white border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-3">
                              <button
                                onClick={() => handleToggleTopicComplete(subject, topic.id)}
                                className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                  topic.completed
                                    ? 'bg-emerald-500 border-emerald-400 text-white'
                                    : 'border-slate-300 hover:border-indigo-400 text-transparent'
                                }`}
                                title={topic.completed ? 'Topic completed' : 'Mark as completed'}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                              </button>

                              <div>
                                <div className="flex items-center gap-2">
                                  {topic.chapterOrUnit && (
                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {topic.chapterOrUnit}
                                    </span>
                                  )}
                                  <span
                                    className={`text-sm font-semibold ${
                                      topic.completed ? 'line-through text-slate-400' : 'text-slate-800'
                                    }`}
                                  >
                                    {topic.name}
                                  </span>
                                </div>

                                {topic.keyConcepts && topic.keyConcepts.length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    {topic.keyConcepts.map((kc, i) => (
                                      <span
                                        key={i}
                                        className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded"
                                      >
                                        #{kc}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right info & actions */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {topic.estimatedMinutes}m
                                </span>

                                <span
                                  className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                    topic.difficulty === 'critical'
                                      ? 'bg-rose-50 text-rose-700'
                                      : topic.difficulty === 'hard'
                                      ? 'bg-amber-50 text-amber-700'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {topic.difficulty}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onNavigateToQuiz(subject.id, topic.name)}
                                  className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                                  title="Generate AI practice questions for this topic"
                                >
                                  <Sparkles className="w-3 h-3" />
                                  <span>Quiz</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteTopic(subject, topic.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Delete topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
