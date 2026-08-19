import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  X,
  Flame,
  BookOpen,
  Coffee,
  Brain
} from 'lucide-react';
import { StudySession } from '../types';
import { soundEngine } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface FocusTimerModalProps {
  session?: StudySession | null;
  onClose: () => void;
  onSessionComplete: (session: StudySession | null, minutesStudied: number, notes: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  session,
  onClose,
  onSessionComplete,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(session?.durationMinutes || 25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(selectedDuration * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
  const [ambientType, setAmbientType] = useState<'none' | 'rain' | 'alpha' | 'brown'>('none');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  const ambientNodeRef = useRef<{ stop: () => void } | null>(null);

  // Sync with duration change if timer not running
  useEffect(() => {
    if (!isRunning) {
      setTimeLeftSeconds(selectedDuration * 60);
    }
  }, [selectedDuration]);

  // Ambient sound manager
  useEffect(() => {
    if (ambientNodeRef.current) {
      ambientNodeRef.current.stop();
      ambientNodeRef.current = null;
    }

    if (isRunning && ambientType !== 'none') {
      ambientNodeRef.current = soundEngine.createAmbientGenerator(ambientType);
    }

    return () => {
      if (ambientNodeRef.current) {
        ambientNodeRef.current.stop();
      }
    };
  }, [isRunning, ambientType]);

  // Ticking effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeftSeconds === 0) {
      // Completed!
      setIsRunning(false);
      soundEngine.playSuccessChord();

      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });

      if (timerMode === 'focus') {
        const completedMinutes = selectedDuration;
        onSessionComplete(session || null, completedMinutes, sessionNotes);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeftSeconds, timerMode, selectedDuration, session, sessionNotes, onSessionComplete]);

  const toggleStartPause = () => {
    soundEngine.playChime(isRunning ? 440 : 659.25);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(selectedDuration * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.max(
    0,
    Math.min(100, ((selectedDuration * 60 - timeLeftSeconds) / (selectedDuration * 60)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Focus Session</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {session ? session.title : 'Focused Study Sprint'}
          </h2>
          {session?.subjectName && (
            <p className="text-xs text-slate-400 font-medium">{session.subjectName}</p>
          )}
        </div>

        {/* Preset Selector */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              setSelectedDuration(25);
              setTimerMode('focus');
              setIsRunning(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedDuration === 25 && timerMode === 'focus'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            25m Pomodoro
          </button>
          <button
            onClick={() => {
              setSelectedDuration(50);
              setTimerMode('focus');
              setIsRunning(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedDuration === 50 && timerMode === 'focus'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            50m Deep Work
          </button>
          <button
            onClick={() => {
              setSelectedDuration(5);
              setTimerMode('break');
              setIsRunning(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              selectedDuration === 5 && timerMode === 'break'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Coffee className="w-3 h-3 inline mr-1" />
            5m Break
          </button>
        </div>

        {/* Circular Countdown Display */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          <div className="w-60 h-60 rounded-full bg-slate-800/60 border-4 border-slate-700 flex flex-col items-center justify-center relative shadow-inner">
            {/* SVG Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="120"
                cy="120"
                r="110"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
              />
              <circle
                cx="120"
                cy="120"
                r="110"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={690}
                strokeDashoffset={690 - (690 * progressPercent) / 100}
                strokeLinecap="round"
                className="text-indigo-500 transition-all duration-1000"
              />
            </svg>

            {/* Centered digits */}
            <div className="text-5xl font-extrabold text-white tracking-tighter tabular-nums z-10">
              {formatTime(timeLeftSeconds)}
            </div>
            <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-widest z-10">
              {isRunning ? 'In Progress' : 'Paused'}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleStartPause}
            className={`px-8 py-3.5 rounded-2xl text-base font-bold flex items-center gap-2 shadow-lg transition-all hover:scale-105 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Start Focus</span>
              </>
            )}
          </button>
        </div>

        {/* Ambient Sound Toggles */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Focus Background Audio:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAmbientType('none')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                ambientType === 'none' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              Mute
            </button>
            <button
              onClick={() => setAmbientType('rain')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                ambientType === 'rain' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              🌧️ Rain
            </button>
            <button
              onClick={() => setAmbientType('alpha')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                ambientType === 'alpha' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              🧠 10Hz Alpha
            </button>
            <button
              onClick={() => setAmbientType('brown')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                ambientType === 'brown' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              🌊 Brown Noise
            </button>
          </div>
        </div>

        {/* Live Session Notes */}
        <div>
          <textarea
            rows={2}
            placeholder="Quick scratchpad notes / formulas for this session..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};
