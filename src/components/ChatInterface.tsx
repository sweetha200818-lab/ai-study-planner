import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  BookOpen,
  Building2,
  Calendar,
  CreditCard,
  Building,
  Phone,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, CollegeData } from '../types';
import { apiService } from '../services/api';

interface ChatInterfaceProps {
  collegeData: CollegeData;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  isLoading: boolean;
  onNavigateToTab: (tab: 'chat' | 'info' | 'departments' | 'courses' | 'contact') => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  collegeData,
  messages,
  onSendMessage,
  onClearChat,
  isLoading,
  onNavigateToTab,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const text = inputValue.trim();
    setInputValue('');
    onSendMessage(text);
  };

  const handleQuickQuestion = (query: string) => {
    if (isLoading) return;
    onSendMessage(query);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string, id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Quick Questions specified by the user prompt
  const quickActionButtons = [
    {
      id: 'courses',
      label: 'Courses',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      query: 'What courses and degree programs are offered with eligibility and fees?',
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: <Building2 className="w-3.5 h-3.5" />,
      query: 'What are the academic departments and who are the Heads of Department (HODs)?',
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: <Calendar className="w-3.5 h-3.5" />,
      query: 'What is the semester examination schedule, passing criteria, and hall ticket release date?',
    },
    {
      id: 'fees',
      label: 'Fees',
      icon: <CreditCard className="w-3.5 h-3.5" />,
      query: 'What is the annual tuition and hostel fee structure, due dates, and scholarships?',
    },
    {
      id: 'campus',
      label: 'Campus',
      icon: <Building className="w-3.5 h-3.5" />,
      query: 'What campus facilities are available, such as the library, hostels, cafeteria, and sports?',
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: <Phone className="w-3.5 h-3.5" />,
      query: 'What are the official contact numbers, office hours, and admissions desk details?',
    },
  ];

  // Frequent student question prompts
  const samplePrompts = [
    'What are the B.Tech CSE eligibility criteria and fees?',
    'When are the semester end exams?',
    'What are the central library working hours?',
    'How much is the hostel fee per year?',
    'Who is the HOD for Artificial Intelligence?',
    'What were the highest placement packages this year?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto px-3 sm:px-6 py-4">
      {/* College Title & Quick Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {collegeData.collegeName}
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {collegeData.code}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {collegeData.accreditation}
          </p>
        </div>

        {/* Clear Chat Button */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              title="Clear current conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Questions Navigation Buttons */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1 pr-2">
            Quick Topics:
          </span>
          {quickActionButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => handleQuickQuestion(btn.query)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 shadow-2xs whitespace-nowrap transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="text-blue-600">{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto py-8 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 text-blue-600 flex items-center justify-center shadow-inner">
              <Bot className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                College AI Assistant
              </h2>
              <p className="text-sm font-semibold text-blue-600">
                Ask. Learn. Get Answers.
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Get instant answers about courses, departments, exams, fees, campus facilities, and office timings.
              </p>
            </div>

            {/* Popular Questions Grid */}
            <div className="w-full space-y-2 text-left pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                Try asking questions like:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(prompt)}
                    className="p-3 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-xs font-medium text-slate-700 hover:text-blue-900 transition-all text-left shadow-2xs group flex items-start justify-between gap-2"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation stream */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
              >
                {/* AI Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                  }`}
                >
                  {/* Formatted Text Content */}
                  <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                    {formatMarkdownText(msg.text)}
                  </div>

                  {/* Message Footer: Timestamp and Utility buttons */}
                  <div
                    className={`flex items-center justify-between gap-3 mt-2 pt-1.5 border-t text-[11px] ${
                      isUser
                        ? 'border-blue-500/50 text-blue-100'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Copy Answer"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Read aloud"
                        >
                          {speakingMessageId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-slate-500">Thinking…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prominent Chatbot Input Box */}
      <form onSubmit={handleSubmit} className="mt-3 relative">
        <div className="flex items-center gap-2 bg-white border-2 border-slate-200 focus-within:border-blue-600 rounded-2xl p-1.5 shadow-sm transition-all">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask your college-related question…"
            disabled={isLoading}
            className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper: Formats basic markdown bold, lists, and code for easy reading
function formatMarkdownText(text: string) {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Bullet list item
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const content = line.trim().substring(2);
      return (
        <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
          <span className="text-blue-600 font-bold leading-none mt-1">•</span>
          <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
        </div>
      );
    }

    // Numbered list item (e.g. 1. 2.)
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+\.)\s(.*)$/);
      if (match) {
        return (
          <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
            <span className="text-blue-700 font-bold text-xs shrink-0 mt-0.5">{match[1]}</span>
            <span dangerouslySetInnerHTML={{ __html: parseBold(match[2]) }} />
          </div>
        );
      }
    }

    // Empty line / paragraph break
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    // Normal line
    return (
      <p
        key={idx}
        dangerouslySetInnerHTML={{ __html: parseBold(line) }}
        className="leading-relaxed"
      />
    );
  });
}

function parseBold(str: string): string {
  // Replace **bold** with <strong>
  let html = str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
  // Replace `code` with styled span
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-blue-700 text-xs font-mono font-medium">$1</code>');
  return html;
}
