import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldAlert,
  Building,
  User,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Globe
} from 'lucide-react';
import { CollegeData } from '../types';

interface ContactViewProps {
  collegeData: CollegeData;
  onAskAI: (query: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({
  collegeData,
  onAskAI,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>Campus Directory & Helpdesk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct contacts for admissions, academic dean, examination cell, and student emergency services.
          </p>
        </div>

        <button
          onClick={() => onAskAI('Who should I contact for admissions, exam revaluation, and hostel accommodation?')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-2 transition-all active:scale-95 self-start sm:self-center"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI for Contact Help</span>
        </button>
      </div>

      {/* Emergency & Helpline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>24/7 Campus Emergency & Medical</span>
          </div>
          <p className="text-lg font-extrabold text-rose-900">
            {collegeData.emergencyHelpline.split('(')[0]}
          </p>
          <p className="text-xs text-rose-700">
            Round-the-clock campus ambulance, resident doctor, and security dispatch.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>Anti-Ragging Helpline</span>
          </div>
          <p className="text-base font-extrabold text-amber-900">
            {collegeData.antiRaggingHelpline.split('/')[0]}
          </p>
          <p className="text-xs text-amber-700">
            Zero-tolerance confidential student grievance and safety helpline.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
            <Phone className="w-4 h-4 text-blue-600" />
            <span>Admissions Helpline</span>
          </div>
          <p className="text-base font-extrabold text-blue-900">
            {collegeData.admissionPhone.split('/')[0]}
          </p>
          <p className="text-xs text-blue-700">
            Mon–Sat, 8:30 AM – 5:30 PM for counseling and seat allotment queries.
          </p>
        </div>
      </div>

      {/* Key Officials Directory */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          <span>Administrative Officials & Office Heads</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collegeData.contacts.map((contact, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-5 shadow-xs space-y-3 transition-colors"
            >
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                  {contact.designation}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1.5">
                  {contact.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {contact.department}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-blue-700 hover:underline font-mono text-[11px] truncate">
                    {contact.email}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800">{contact.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-600">{contact.officeRoom}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus Location & Address Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <span>Campus Address & Visiting Hours</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600">
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 text-sm block">
              {collegeData.collegeName}
            </span>
            <p className="leading-relaxed">
              {collegeData.address}<br />
              {collegeData.city}, {collegeData.state} - {collegeData.pincode}
            </p>
            <p className="pt-2 font-medium text-slate-800">
              General Enquiry: <a href={`mailto:${collegeData.generalEmail}`} className="text-blue-600 hover:underline">{collegeData.generalEmail}</a>
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="font-bold text-slate-900 text-sm block">
              Visitor & Public Working Hours
            </span>
            <p className="leading-relaxed">
              <strong>Campus Gates:</strong> Open 06:00 AM – 09:00 PM daily<br />
              <strong>Administrative Office:</strong> Monday – Friday (08:30 AM – 04:30 PM)<br />
              <strong>Parents & Visitor Desk:</strong> Monday – Saturday (10:00 AM – 01:00 PM)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
