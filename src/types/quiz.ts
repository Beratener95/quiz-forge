export interface Question {
  id: string;
  type: 'multiple_choice' | 'text';
  question: string;
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface Quiz {
  title: string;
  description: string;
  questions: Question[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
