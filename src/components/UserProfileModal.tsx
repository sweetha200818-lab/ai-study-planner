import React, { useState } from 'react';
import { User, X, CheckCircle2, Award, Zap, BookOpen, Flame, GraduationCap } from 'lucide-react';
import { StudentProfile } from '../types';
import { soundEngine } from '../utils/soundEffects';

interface UserProfileModalProps {
  profile: StudentProfile;
  onClose: () => void;
  onUpdateProfile: (profile: StudentProfile) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  profile,
  onClose,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [gradeLevel, setGradeLevel] = useState(profile.gradeLevel || 'College / University');
  const [dailyTargetHours, setDailyTargetHours] = useState(profile.dailyTargetHours || 2.5);
  const [learningStyle, setLearningStyle] = useState(
    profile.learningStyle || 'Active Recall & Practice Heavy'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      name: name.trim() || 'Student',
      email: email.trim(),
      gradeLevel,
      dailyTargetHours: Number(dailyTargetHours),
      learningStyle,
    });
    soundEngine.playSuccessChord();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Student Account & Preferences</h2>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-600/30">
              L{profile.level}
            </div>
            <div>
              <div className="font-bold text-white text-sm">{profile.name}</div>
              <div className="text-xs text-indigo-300 flex items-center gap-1.5 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{profile.currentStreak} Day Streak</span>
                <span>•</span>
                <span>{profile.xp} XP</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Level</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value="High School">High School</option>
                <option value="College / University">College / University</option>
                <option value="Graduate / Medical / Law">Graduate / Professional</option>
                <option value="Self-Learner">Self-Learner / Certifications</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Daily Study Target</label>
              <select
                value={dailyTargetHours}
                onChange={(e) => setDailyTargetHours(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
              >
                <option value={1.5}>1.5 Hours / day</option>
                <option value={2.0}>2.0 Hours / day</option>
                <option value={2.5}>2.5 Hours / day</option>
                <option value={3.5}>3.5 Hours / day</option>
                <option value={5.0}>5.0 Hours / day</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Learning Style</label>
            <select
              value={learningStyle}
              onChange={(e) => setLearningStyle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            >
              <option value="Active Recall & Practice Heavy">Active Recall & Practice Heavy</option>
              <option value="Spaced Repetition & Deep Work">Spaced Repetition & Deep Work</option>
              <option value="Pomodoro Sprints (25/5)">Pomodoro Sprints (25/5)</option>
              <option value="Visual Mind Mapping">Visual Mind Mapping</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
