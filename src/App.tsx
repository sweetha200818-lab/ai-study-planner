import React, { useState, useEffect } from 'react';
import { CollegeData, ChatMessage } from './types';
import { defaultCollegeData } from './data/defaultCollegeData';
import { Navbar } from './components/Navbar';
import { ChatInterface } from './components/ChatInterface';
import { CollegeInfoView } from './components/CollegeInfoView';
import { DepartmentsView } from './components/DepartmentsView';
import { CoursesView } from './components/CoursesView';
import { ContactView } from './components/ContactView';
import { KnowledgeBaseEditorModal } from './components/KnowledgeBaseEditorModal';
import { apiService } from './services/api';

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'chat' | 'info' | 'departments' | 'courses' | 'contact'>('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // College Knowledge Base State (Persisted in localStorage with default fallback)
  const [collegeData, setCollegeData] = useState<CollegeData>(() => {
    try {
      const saved = localStorage.getItem('college_ai_knowledge_base');
      return saved ? JSON.parse(saved) : defaultCollegeData;
    } catch {
      return defaultCollegeData;
    }
  });

  // Chat History State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('college_ai_chat_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Save college knowledge base to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('college_ai_knowledge_base', JSON.stringify(collegeData));
    } catch (e) {
      console.error('Failed to save college data', e);
    }
  }, [collegeData]);

  // Save chat messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('college_ai_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [messages]);

  // Send message handler
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text.trim(),
      timestamp: timeString,
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // API call to College AI Assistant endpoint
      const response = await apiService.sendMessage({
        message: text.trim(),
        history: updatedHistory.map((m) => ({ sender: m.sender, text: m.text })),
        collegeKnowledge: collegeData,
      });

      const aiReplyText = response.success && response.reply
        ? response.reply
        : "Sorry, I don't have that information. Please check with the college helpdesk.";

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: 'assistant',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error sending message:', error);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        text: "Sorry, I don't have that information right now. Please try asking again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear chat conversation
  const handleClearChat = () => {
    setMessages([]);
    try {
      localStorage.removeItem('college_ai_chat_history');
    } catch (e) {
      console.error('Failed to clear chat storage', e);
    }
  };

  // Ask AI shortcut from any tab
  const handleAskAIFromTab = (query: string) => {
    setCurrentTab('chat');
    handleSendMessage(query);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collegeData={collegeData}
        onOpenEditor={() => setIsEditorOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main View Display */}
      <main className="flex-1">
        {currentTab === 'chat' && (
          <ChatInterface
            collegeData={collegeData}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            isLoading={isLoading}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'info' && (
          <CollegeInfoView
            collegeData={collegeData}
            onAskAI={handleAskAIFromTab}
          />
        )}

        {currentTab === 'departments' && (
          <DepartmentsView
            collegeData={collegeData}
            onAskAI={handleAskAIFromTab}
          />
        )}

        {currentTab === 'courses' && (
          <CoursesView
            collegeData={collegeData}
            onAskAI={handleAskAIFromTab}
          />
        )}

        {currentTab === 'contact' && (
          <ContactView
            collegeData={collegeData}
            onAskAI={handleAskAIFromTab}
          />
        )}
      </main>

      {/* Knowledge Base Customizer Modal */}
      <KnowledgeBaseEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        collegeData={collegeData}
        onSave={(updated) => setCollegeData(updated)}
      />
    </div>
  );
}
