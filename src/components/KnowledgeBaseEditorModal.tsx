import React, { useState } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Building2,
  BookOpen,
  Calendar,
  CreditCard,
  Building,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CollegeData } from '../types';
import { defaultCollegeData } from '../data/defaultCollegeData';

interface KnowledgeBaseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  collegeData: CollegeData;
  onSave: (updatedData: CollegeData) => void;
}

export const KnowledgeBaseEditorModal: React.FC<KnowledgeBaseEditorModalProps> = ({
  isOpen,
  onClose,
  collegeData,
  onSave,
}) => {
  const [formData, setFormData] = useState<CollegeData>(collegeData);
  const [activeTab, setActiveTab] = useState<'basic' | 'departments' | 'courses' | 'exams' | 'fees'>('basic');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all college information back to the default template?')) {
      setFormData(defaultCollegeData);
      onSave(defaultCollegeData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Customize College Knowledge Base
            </h2>
            <p className="text-xs text-slate-500">
              Update college details to immediately change the AI assistant's answers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToDefault}
              type="button"
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors flex items-center gap-1"
              title="Reset to default sample data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'departments', label: 'Departments' },
            { id: 'courses', label: 'Courses' },
            { id: 'exams', label: 'Exams' },
            { id: 'fees', label: 'Fees & Aid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 border-b-2 text-xs font-bold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'basic' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">College Full Name</label>
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Name / Code</label>
                  <input
                    type="text"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motto / Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Principal Name</label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Accreditation Details</label>
                  <input
                    type="text"
                    value={formData.accreditation}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campus Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">General Telephone</label>
                  <input
                    type="text"
                    value={formData.generalPhone}
                    onChange={(e) => setFormData({ ...formData, generalPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admissions Helpline</label>
                  <input
                    type="text"
                    value={formData.admissionPhone}
                    onChange={(e) => setFormData({ ...formData, admissionPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">General Email</label>
                  <input
                    type="email"
                    value={formData.generalEmail}
                    onChange={(e) => setFormData({ ...formData, generalEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admissions Email</label>
                  <input
                    type="email"
                    value={formData.admissionEmail}
                    onChange={(e) => setFormData({ ...formData, admissionEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 italic">
                Edit department details below. The AI assistant uses these to answer faculty and lab queries.
              </p>
              {formData.departments.map((dept, index) => (
                <div key={dept.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-0.5">Department Name</label>
                      <input
                        type="text"
                        value={dept.name}
                        onChange={(e) => {
                          const updated = [...formData.departments];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, departments: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">Code</label>
                      <input
                        type="text"
                        value={dept.code}
                        onChange={(e) => {
                          const updated = [...formData.departments];
                          updated[index].code = e.target.value;
                          setFormData({ ...formData, departments: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">HOD Name</label>
                      <input
                        type="text"
                        value={dept.hod}
                        onChange={(e) => {
                          const updated = [...formData.departments];
                          updated[index].hod = e.target.value;
                          setFormData({ ...formData, departments: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">HOD Email</label>
                      <input
                        type="email"
                        value={dept.hodEmail}
                        onChange={(e) => {
                          const updated = [...formData.departments];
                          updated[index].hodEmail = e.target.value;
                          setFormData({ ...formData, departments: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 italic">
                Manage degree offerings, annual tuition fees, and admission eligibility criteria.
              </p>
              {formData.courses.map((course, index) => (
                <div key={course.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-700 block mb-0.5">Program Name</label>
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => {
                          const updated = [...formData.courses];
                          updated[index].name = e.target.value;
                          setFormData({ ...formData, courses: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">Annual Fee (₹)</label>
                      <input
                        type="number"
                        value={course.annualTuitionFee}
                        onChange={(e) => {
                          const updated = [...formData.courses];
                          updated[index].annualTuitionFee = Number(e.target.value);
                          setFormData({ ...formData, courses: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Eligibility Criteria</label>
                    <input
                      type="text"
                      value={course.eligibility}
                      onChange={(e) => {
                        const updated = [...formData.courses];
                        updated[index].eligibility = e.target.value;
                        setFormData({ ...formData, courses: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 italic">
                Set active examination titles, schedules, hall ticket dates, and pass marks.
              </p>
              {formData.exams.map((exam, index) => (
                <div key={exam.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Exam Title</label>
                    <input
                      type="text"
                      value={exam.title}
                      onChange={(e) => {
                        const updated = [...formData.exams];
                        updated[index].title = e.target.value;
                        setFormData({ ...formData, exams: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">Schedule Range</label>
                      <input
                        type="text"
                        value={exam.scheduleRange}
                        onChange={(e) => {
                          const updated = [...formData.exams];
                          updated[index].scheduleRange = e.target.value;
                          setFormData({ ...formData, exams: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">Hall Ticket Release</label>
                      <input
                        type="text"
                        value={exam.hallTicketReleaseDate}
                        onChange={(e) => {
                          const updated = [...formData.exams];
                          updated[index].hallTicketReleaseDate = e.target.value;
                          setFormData({ ...formData, exams: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-500 italic">
                Manage general tuition, hostel & mess charges, and payment due dates.
              </p>
              {formData.fees.map((fee, index) => (
                <div key={fee.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">Category</label>
                      <input
                        type="text"
                        value={fee.category}
                        onChange={(e) => {
                          const updated = [...formData.fees];
                          updated[index].category = e.target.value;
                          setFormData({ ...formData, fees: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-0.5">Amount / Range</label>
                      <input
                        type="text"
                        value={fee.amount}
                        onChange={(e) => {
                          const updated = [...formData.fees];
                          updated[index].amount = e.target.value;
                          setFormData({ ...formData, fees: updated });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Due Date & Instructions</label>
                    <input
                      type="text"
                      value={fee.dueDate}
                      onChange={(e) => {
                        const updated = [...formData.fees];
                        updated[index].dueDate = e.target.value;
                        setFormData({ ...formData, fees: updated });
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Changes are saved locally to your browser.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Knowledge Base</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
