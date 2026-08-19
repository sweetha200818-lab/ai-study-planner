import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Award,
  Zap,
  Layers,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Check
} from 'lucide-react';
import { Subject, Quiz, Question, Flashcard } from '../types';
import { apiService } from '../services/api';
import { soundEngine } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface QuizArenaProps {
  subjects: Subject[];
  quizzes: Quiz[];
  preselectedSubjectId?: string;
  preselectedTopicName?: string;
  onSaveQuizResult: (quiz: Quiz) => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  subjects,
  quizzes,
  preselectedSubjectId,
  preselectedTopicName,
  onSaveQuizResult,
}) => {
  // Mode: generator | taking_quiz | taking_flashcards | summary
  const [arenaMode, setArenaMode] = useState<'generator' | 'taking_quiz' | 'flashcards' | 'history'>('generator');

  // Generator form
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    preselectedSubjectId || subjects[0]?.id || ''
  );
  const [topicInput, setTopicInput] = useState<string>(preselectedTopicName || '');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Active Quiz taking state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Active Flashcards state
  const [activeFlashcards, setActiveFlashcards] = useState<Flashcard[]>([]);
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedSubjectId) setSelectedSubjectId(preselectedSubjectId);
    if (preselectedTopicName) setTopicInput(preselectedTopicName);
  }, [preselectedSubjectId, preselectedTopicName]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId || !topicInput.trim() || isGenerating) return;

    const sub = subjects.find((s) => s.id === selectedSubjectId);
    setIsGenerating(true);

    try {
      const res = await apiService.generateQuiz({
        subjectName: sub?.name || 'General',
        topicName: topicInput.trim(),
        difficulty,
        questionCount,
      });

      if (res.success && res.data) {
        const newQuiz: Quiz = {
          id: `quiz-${Date.now()}`,
          subjectId: selectedSubjectId,
          subjectName: sub?.name || 'Subject',
          topicName: topicInput.trim(),
          title: res.data.title || `${sub?.name} - ${topicInput} Practice Quiz`,
          questions: res.data.questions || [],
          flashcards: res.data.flashcards || [],
          difficulty,
          createdAt: new Date().toISOString(),
        };

        setActiveQuiz(newQuiz);
        setActiveFlashcards(res.data.flashcards || []);
        setCurrentQIndex(0);
        setSelectedAnswers({});
        setShowExplanation(false);
        setQuizScore(null);
        setArenaMode('taking_quiz');
        soundEngine.playSuccessChord();
      }
    } catch (err) {
      console.error('Quiz generation error', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (showExplanation) return; // Locked once revealed
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    soundEngine.playClick();
  };

  const handleCheckAnswer = () => {
    setShowExplanation(true);
    const currQ = activeQuiz?.questions[currentQIndex];
    if (currQ && selectedAnswers[currQ.id] === currQ.correctIndex) {
      soundEngine.playChime(783.99);
    } else {
      soundEngine.playChime(329.63);
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setShowExplanation(false);
    } else {
      // Finish Quiz
      let correct = 0;
      activeQuiz.questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctIndex) {
          correct++;
        }
      });

      const total = activeQuiz.questions.length;
      const scorePct = Math.round((correct / total) * 100);
      setQuizScore(scorePct);

      const completedQuiz: Quiz = {
        ...activeQuiz,
        score: scorePct,
        totalQuestions: total,
      };

      onSaveQuizResult(completedQuiz);
      confetti({
        particleCount: 70,
        spread: 80,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI Practice & Flashcards Arena</h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Active Recall Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Synthesize dynamic test questions, explanations, and spaced flashcards from any chapter
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setArenaMode('generator')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              arenaMode === 'generator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Create Drill
          </button>

          {activeFlashcards.length > 0 && (
            <button
              onClick={() => setArenaMode('flashcards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                arenaMode === 'flashcards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Flashcards ({activeFlashcards.length})
            </button>
          )}

          <button
            onClick={() => setArenaMode('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              arenaMode === 'history'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            History ({quizzes.length})
          </button>
        </div>
      </div>

      {/* MODE 1: Quiz Generator Configuration Form */}
      {arenaMode === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                ✨
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure AI Practice Set</h3>
                <p className="text-xs text-slate-500">
                  Target high-yield exam concepts with instant reasoning breakdown
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    setSelectedSubjectId(e.target.value);
                    const sub = subjects.find((s) => s.id === e.target.value);
                    if (sub && sub.topics.length > 0) {
                      setTopicInput(sub.topics[0].name);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.topics.length} topics)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Topic or Specific Chapter</label>
                  {subjects.find((s) => s.id === selectedSubjectId)?.topics && (
                    <div className="flex gap-1 overflow-x-auto max-w-[280px]">
                      {subjects
                        .find((s) => s.id === selectedSubjectId)
                        ?.topics.slice(0, 3)
                        .map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setTopicInput(t.name)}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 truncate"
                          >
                            {t.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thermodynamics Laws, Integration by Parts, Cell Respiration"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Question Count</label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800"
                  >
                    <option value={3}>3 Quick Warm-up Questions</option>
                    <option value={5}>5 Standard Exam Questions</option>
                    <option value={8}>8 Comprehensive Drill Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800"
                  >
                    <option value="easy">Easy (Fundamentals)</option>
                    <option value="medium">Medium (Standard Exam Pacing)</option>
                    <option value="hard">Hard (Advanced / Challenging)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !topicInput.trim()}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>Gemini AI is Generating Questions & Flashcards...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Generate Practice Questions & Flashcards</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info & Tips Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <span>💡</span> Active Recall Strategy
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Testing yourself immediately after reading produces up to{' '}
                <strong className="text-indigo-600">50% higher exam retention</strong> compared to re-reading. Each
                question is structured with deep conceptual explanations.
              </p>
            </div>

            <div className="bg-indigo-600 text-white rounded-2xl p-5 shadow-md space-y-3">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span>🃏</span> Spaced Flashcard Decks
              </h4>
              <p className="text-xs text-indigo-100 leading-relaxed">
                Every quiz generation also automatically creates a paired set of key definition flashcards to practice
                anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Taking Active Quiz */}
      {arenaMode === 'taking_quiz' && activeQuiz && (
        <div className="max-w-3xl mx-auto space-y-5">
          {/* Quiz Progress Top Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                {activeQuiz.subjectName}
              </span>
              <h3 className="font-bold text-sm sm:text-base text-slate-900">{activeQuiz.topicName}</h3>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Question {currentQIndex + 1} of {activeQuiz.questions.length}
              </span>
            </div>
          </div>

          {/* Question Card */}
          {quizScore === null ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Question Text */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Problem {currentQIndex + 1}
                </div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {activeQuiz.questions[currentQIndex]?.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {activeQuiz.questions[currentQIndex]?.options.map((opt, optIdx) => {
                  const currQ = activeQuiz.questions[currentQIndex];
                  const isSelected = selectedAnswers[currQ.id] === optIdx;
                  const isCorrect = currQ.correctIndex === optIdx;

                  let optionStyle =
                    'bg-slate-50 border-slate-200 hover:border-indigo-300 text-slate-800';

                  if (showExplanation) {
                    if (isCorrect) {
                      optionStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                    } else {
                      optionStyle = 'bg-slate-50 border-slate-200 opacity-50';
                    }
                  } else if (isSelected) {
                    optionStyle =
                      'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 font-bold';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(currQ.id, optIdx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-start justify-between gap-3 ${optionStyle}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="mt-0.5">{opt}</span>
                      </div>

                      {showExplanation && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {showExplanation && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {showExplanation && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Conceptual Breakdown & Reasoning
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeQuiz.questions[currentQIndex]?.explanation}
                  </p>
                </div>
              )}

              {/* Action Buttons Bottom */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setArenaMode('generator')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  Exit Drill
                </button>

                <div className="flex items-center gap-3">
                  {!showExplanation ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedAnswers[activeQuiz.questions[currentQIndex]?.id] === undefined}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all"
                    >
                      <span>
                        {currentQIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'View Results'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-5 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                {quizScore >= 80 ? '🏆' : quizScore >= 60 ? '✨' : '📚'}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">Drill Completed!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  You scored <strong className="text-indigo-600 font-bold">{quizScore}%</strong> on{' '}
                  {activeQuiz.topicName}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setCurrentQIndex(0);
                    setSelectedAnswers({});
                    setShowExplanation(false);
                    setQuizScore(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Quiz</span>
                </button>

                {activeFlashcards.length > 0 && (
                  <button
                    onClick={() => setArenaMode('flashcards')}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Practice Flashcards</span>
                  </button>
                )}

                <button
                  onClick={() => setArenaMode('generator')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
                >
                  New Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Interactive Flashcards Flip Mode */}
      {arenaMode === 'flashcards' && activeFlashcards.length > 0 && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Card {flashcardIndex + 1} of {activeFlashcards.length}
            </span>
            <span>Click card to flip</span>
          </div>

          {/* Flip Card */}
          <div
            onClick={() => {
              setIsCardFlipped(!isCardFlipped);
              soundEngine.playClick();
            }}
            className="w-full h-72 bg-white border-2 border-indigo-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-lg hover:border-indigo-400 transition-all select-none relative"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 absolute top-4 left-6">
              {isCardFlipped ? 'Answer / Concept' : 'Question / Term'}
            </span>

            <div className="text-base sm:text-xl font-bold text-slate-800 max-w-md leading-relaxed">
              {isCardFlipped
                ? activeFlashcards[flashcardIndex]?.back
                : activeFlashcards[flashcardIndex]?.front}
            </div>

            <span className="text-[11px] text-slate-400 mt-4 block">🔄 Tap to flip</span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                setFlashcardIndex((prev) => Math.max(0, prev - 1));
                setIsCardFlipped(false);
              }}
              disabled={flashcardIndex === 0}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-40"
            >
              Previous Card
            </button>

            <button
              onClick={() => {
                setFlashcardIndex((prev) => Math.min(activeFlashcards.length - 1, prev + 1));
                setIsCardFlipped(false);
              }}
              disabled={flashcardIndex === activeFlashcards.length - 1}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold disabled:opacity-40 shadow-md"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {/* MODE 4: Past Quizzes History */}
      {arenaMode === 'history' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Saved Practice History</h3>
          {quizzes.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No completed quizzes yet.</p>
          ) : (
            <div className="space-y-2.5">
              {quizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-600">{q.subjectName}</span>
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-800">{q.title}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(q.createdAt).toLocaleDateString()} • {q.questions.length} questions
                    </span>
                  </div>

                  <div className="text-right">
                    {q.score !== undefined && (
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {q.score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
