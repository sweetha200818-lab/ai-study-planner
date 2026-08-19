import { CollegeData, ChatMessage } from '../types';

export interface ChatRequest {
  message: string;
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  collegeKnowledge: CollegeData;
}

export interface ChatResponse {
  success: boolean;
  reply?: string;
  error?: string;
  fallback?: boolean;
}

export const apiService = {
  async sendMessage(params: ChatRequest): Promise<ChatResponse> {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive response from College AI Assistant');
      }

      return {
        success: true,
        reply: data.reply,
        fallback: data.fallback,
      };
    } catch (err: any) {
      console.error('API sendMessage error:', err);
      return {
        success: false,
        error: err.message || 'Network error occurred while reaching the college assistant.',
      };
    }
  },
};
