import React, { useState } from 'react';
import { BookOpen, X, Sparkles, Plus } from 'lucide-react';
import { Subject, DifficultyLevel } from '../types';
import { apiService } from '../services/api';

interface AddSubjectModalProps {
  onClose: () => void;
  onAddSubject: (subject: Subject) => void;
}

const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#6366F1', // Indigo
];

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ onClose, onAddSubject }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [targetGrade, setTargetGrade] = useState('A');
  const [examDate, setExamDate] = useState('');
  const [notes, setNotes] = useState('');
  const [autoSuggestSyllabus, setAutoSuggestSyllabus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    let topics: any[] = [];

    if (autoSuggestSyllabus) {
      try {
        const res = await apiService.suggestTopics({
          subjectName: name.trim(),
          gradeLevel: 'Undergraduate / High School',
        });
        if (res.success && res.data && res.data.topics) {
          topics = res.data.topics.map((t: any, idx: number) => ({
            id: `top-${Date.now()}-${idx}`,
            subjectId: `sub-${Date.now()}`,
            name: t.name,
            chapterOrUnit: t.chapterOrUnit || `Chapter ${idx + 1}`,
            difficulty: t.difficulty || 'medium',
            estimatedMinutes: t.estimatedMinutes || 90,
            completed: false,
            keyConcepts: t.keyConcepts,
          }));
        }
      } catch (err) {
        console.error('Failed to auto suggest syllabus', err);
      }
    }

    if (topics.length === 0) {
      // Default initial topics
      topics = [
        {
          id: `top-${Date.now()}-1`,
          subjectId: `sub-${Date.now()}`,
          name: 'Unit 1: Fundamentals & Core Principles',
          chapterOrUnit: 'Chapter 1',
          difficulty: 'easy',
          estimatedMinutes: 60,
          completed: false,
        },
        {
          id: `top-${Date.now()}-2`,
          subjectId: `sub-${Date.now()}`,
          name: 'Unit 2: Intermediate Problem Solving',
          chapterOrUnit: 'Chapter 2',
          difficulty: 'medium',
          estimatedMinutes: 90,
          completed: false,
        },
      ];
    }

    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || undefined,
      color,
      difficulty,
      targetGrade,
      examDate: examDate || undefined,
      notes: notes.trim(),
      topics,
    };

    onAddSubject(newSubject);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Add New Subject</h2>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Course Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Organic Chemistry II, Microeconomics, AP Biology"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course Code</label>
              <input
                type="text"
                placeholder="e.g. CHEM 202"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Grade</label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
              >
                <option value="A+">A+ (97-100%)</option>
                <option value="A">A (93-96%)</option>
                <option value="A-">A- (90-92%)</option>
                <option value="B+">B+ (87-89%)</option>
                <option value="Pass">Pass / High Score</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e: any) => setDifficulty(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
              >
                <option value="easy">Easy (Foundations)</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="critical">Critical (Highest Priority)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Date (Optional)</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Color Accent</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Auto syllabus checkbox */}
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3">
            <input
              type="checkbox"
              id="auto-syllabus"
              checked={autoSuggestSyllabus}
              onChange={(e) => setAutoSuggestSyllabus(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="auto-syllabus" className="text-xs text-indigo-200 cursor-pointer">
              <strong>AI Auto-Generate Syllabus Breakdown:</strong> Automatically generate 5-8 structured course topics and chapters with estimated hours.
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Creating & Generating Syllabus...' : 'Create Subject'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
