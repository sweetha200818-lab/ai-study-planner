import React, { useState } from 'react';
import { Bell, X, CheckCircle2, Clock, Volume2, ShieldCheck } from 'lucide-react';
import { ReminderSetting } from '../types';
import { soundEngine } from '../utils/soundEffects';

interface RemindersSettingsModalProps {
  reminders: ReminderSetting[];
  onClose: () => void;
  onUpdateReminders: (updated: ReminderSetting[]) => void;
}

export const RemindersSettingsModal: React.FC<RemindersSettingsModalProps> = ({
  reminders,
  onClose,
  onUpdateReminders,
}) => {
  const [localReminders, setLocalReminders] = useState<ReminderSetting[]>(reminders);
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const toggleReminder = (id: string) => {
    setLocalReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateTime = (id: string, time: string) => {
    setLocalReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, scheduledTime: time } : r))
    );
  };

  const requestBrowserPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        soundEngine.playSuccessChord();
        new Notification('AI Study Planner', {
          body: 'Study reminders are now enabled on this device! 📚',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const handleSave = () => {
    onUpdateReminders(localReminders);
    soundEngine.playChime(659.25);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">Study Reminders & Notifications</h2>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Browser permission banner */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-slate-200 block">Browser Push Notifications</span>
            <span className="text-slate-400 text-[11px]">
              Status:{' '}
              <strong className={notificationPermission === 'granted' ? 'text-emerald-400' : 'text-amber-400'}>
                {notificationPermission.toUpperCase()}
              </strong>
            </span>
          </div>

          {notificationPermission !== 'granted' && (
            <button
              type="button"
              onClick={requestBrowserPermission}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Allow Notifications
            </button>
          )}
        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          {localReminders.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-bold text-slate-200">{r.title}</div>
                <div className="text-[11px] text-slate-400 capitalize">{r.type.replace('_', ' ')} alert</div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={r.scheduledTime}
                  onChange={(e) => updateTime(r.id, e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                />

                <button
                  type="button"
                  onClick={() => toggleReminder(r.id)}
                  className={`w-10 h-6 rounded-full transition-colors relative flex items-center px-1 ${
                    r.enabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      r.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
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
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
