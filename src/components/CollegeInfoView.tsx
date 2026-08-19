import React, { useState } from 'react';
import {
  School,
  Clock,
  Calendar,
  CreditCard,
  Building,
  Award,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { CollegeData } from '../types';

interface CollegeInfoViewProps {
  collegeData: CollegeData;
  onAskAI: (query: string) => void;
}

export const CollegeInfoView: React.FC<CollegeInfoViewProps> = ({
  collegeData,
  onAskAI,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'timings' | 'exams' | 'fees' | 'facilities'>('overview');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* College Hero Card */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-bold border border-blue-400/30">
              Code: {collegeData.code}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
              Est. {collegeData.establishedYear}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
              {collegeData.accreditation.split('•')[0]}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {collegeData.collegeName}
          </h1>
          <p className="text-sm text-blue-200 italic font-medium">
            "{collegeData.tagline}"
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-blue-100/90 pt-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-300 shrink-0" />
              <span>{collegeData.address}, {collegeData.city} - {collegeData.pincode}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-blue-300 shrink-0" />
              <span>{collegeData.generalPhone}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-300 shrink-0" />
              <span>{collegeData.generalEmail}</span>
            </div>
          </div>
        </div>

        {/* Floating Quick Ask Button */}
        <div className="mt-6 pt-4 border-t border-blue-700/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-blue-200">
            Have a question about this college? Let our AI Assistant help you instantly.
          </div>
          <button
            onClick={() => onAskAI(`Give me a complete summary of ${collegeData.collegeName}, its courses, and campus life.`)}
            className="px-4 py-2 rounded-xl bg-white text-blue-900 hover:bg-blue-50 text-xs font-bold shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Ask AI Summary</span>
          </button>
        </div>
      </div>

      {/* Navigation Pills for Info Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'overview', label: 'Overview & Contacts', icon: <School className="w-4 h-4" /> },
          { id: 'timings', label: 'Office Timings', icon: <Clock className="w-4 h-4" /> },
          { id: 'exams', label: 'Examinations & Grading', icon: <Calendar className="w-4 h-4" /> },
          { id: 'fees', label: 'Fee Structure & Scholarships', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'facilities', label: 'Campus Facilities', icon: <Building className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeSection === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Section 1: Overview & Contacts */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Institutional Highlights</span>
            </h2>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-0.5">Accreditation & Approvals:</span>
                <p>{collegeData.accreditation}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-0.5">Principal:</span>
                <p>{collegeData.principalName}</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="font-bold text-slate-900 block mb-0.5">Official Website:</span>
                <a href={collegeData.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-semibold">
                  {collegeData.website}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Helplines & Emergency Support</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold block text-rose-950 mb-0.5">Campus Security & Medical Emergency (24/7):</span>
                <span className="font-bold text-sm text-rose-700">{collegeData.emergencyHelpline}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                <span className="font-bold block text-amber-950 mb-0.5">National Anti-Ragging Helpline (Toll-Free):</span>
                <span className="font-bold text-sm text-amber-700">{collegeData.antiRaggingHelpline}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900">
                <span className="font-bold block text-blue-950 mb-0.5">Admissions Enquiry Hotline:</span>
                <span className="font-bold text-sm text-blue-700">{collegeData.admissionPhone}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Office Timings */}
      {activeSection === 'timings' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collegeData.officeTimings.map((timing, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {timing.officeName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                  {timing.workingDays}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span><strong>Working Hours:</strong> {timing.timings}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span><strong>Lunch Break:</strong> {timing.lunchBreak}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span><strong>Location:</strong> {timing.location}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  In-charge: <strong>{timing.inCharge}</strong>
                </div>
              </div>

              <button
                onClick={() => onAskAI(`What are the timings and location for ${timing.officeName}?`)}
                className="w-full mt-2 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Ask AI about this office</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Section 3: Examinations & Grading */}
      {activeSection === 'exams' && (
        <div className="space-y-4">
          {collegeData.exams.map((exam) => (
            <div key={exam.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{exam.title}</h3>
                  <p className="text-xs text-blue-600 font-semibold">{exam.session}</p>
                </div>
                <button
                  onClick={() => onAskAI(`What is the schedule, hall ticket date, and rules for ${exam.title}?`)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI for Exam Rules</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Schedule Range</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{exam.scheduleRange}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Hall Ticket Release</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{exam.hallTicketReleaseDate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Passing Minimum</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{exam.passCriteria}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Revaluation Window</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{exam.revaluationDeadline}</span>
                </div>
              </div>

              {exam.rules && exam.rules.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-xs font-bold text-slate-900 block">Key Examination Regulations:</span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {exam.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section 4: Fees & Scholarships */}
      {activeSection === 'fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collegeData.fees.map((fee) => (
              <div key={fee.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{fee.category}</h3>
                    <p className="text-xs text-slate-500">{fee.frequency}</p>
                  </div>
                  <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                    {fee.amount}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p><strong>Payment Due Date:</strong> {fee.dueDate}</p>
                  <p><strong>Mode of Payment:</strong> {fee.modeOfPayment}</p>
                  <p><strong>Late Fee Policy:</strong> {fee.lateFeePolicy}</p>
                </div>

                {fee.scholarships && fee.scholarships.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-800 block">Available Waivers / Scholarships:</span>
                    <ul className="space-y-1 text-xs text-slate-600">
                      {fee.scholarships.map((sch, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{sch}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => onAskAI(`What are the details, due dates, and scholarships for ${fee.category}?`)}
                  className="w-full py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Ask AI about {fee.category}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 5: Campus Facilities */}
      {activeSection === 'facilities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collegeData.facilities.map((fac) => (
            <div key={fac.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{fac.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {fac.category}
                  </span>
                </div>
                <button
                  onClick={() => onAskAI(`Tell me about the ${fac.name}, its timings, location, and features.`)}
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Ask AI about this facility"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <p><strong>Timings:</strong> {fac.timings}</p>
                <p><strong>Location:</strong> {fac.location}</p>
                <p><strong>Contact:</strong> {fac.contactPerson}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1">
                <span className="text-[11px] font-bold text-slate-800 block">Highlights & Amenities:</span>
                <ul className="space-y-1 text-xs text-slate-600">
                  {fac.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
