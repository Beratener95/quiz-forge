export type QuestionType = 
  | 'multiple_choice'
  | 'multi_select'
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'scale'
  | 'date'
  | 'rating'
  | 'slider'
  | 'image_choice'
  | 'ranking'
  | 'yes_no';

export interface QuestionOption {
  id: string;
  text: string;
  image?: string;
  points?: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  options?: QuestionOption[];
  correctAnswer?: string | string[];
  points: number;
  required: boolean;
  timer?: number;
  image?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface Condition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less';
  value: string;
}

export interface FlowNode {
  id: string;
  questionId?: string;
  type: 'question' | 'result' | 'delay';
  conditions?: Condition[];
  nextNodeId?: string;
  resultId?: string;
}

export interface Result {
  id: string;
  title: string;
  description: string;
  minScore: number;
  maxScore: number;
  image?: string;
}

export interface QuizDesign {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  backgroundImage?: string;
  fontFamily: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  buttonColor: string;
  textColor: string;
  showProgress: boolean;
  showTimer: boolean;
  logo?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  flow: FlowNode[];
  results: Result[];
  design: QuizDesign;
  settings: {
    shuffleQuestions: boolean;
    showResults: boolean;
    collectEmail: boolean;
    redirectUrl?: string;
  };
}

export const defaultDesign: QuizDesign = {
  primaryColor: '#6366f1',
  accentColor: '#22d3ee',
  backgroundColor: '#0a0a0f',
  fontFamily: 'DM Sans',
  buttonStyle: 'rounded',
  buttonColor: '#6366f1',
  textColor: '#f8fafc',
  showProgress: true,
  showTimer: true,
};

export const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
  { value: 'multiple_choice', label: 'Один из многих', icon: '◉' },
  { value: 'multi_select', label: 'Несколько из многих', icon: '☑' },
  { value: 'text', label: 'Текст', icon: '✎' },
  { value: 'email', label: 'Email', icon: '✉' },
  { value: 'phone', label: 'Телефон', icon: '☎' },
  { value: 'number', label: 'Число', icon: '#' },
  { value: 'scale', label: 'Шкала 1-10', icon: '▭' },
  { value: 'date', label: 'Дата', icon: '📅' },
  { value: 'rating', label: 'Рейтинг', icon: '⭐' },
  { value: 'slider', label: 'Слайдер', icon: '↔' },
  { value: 'image_choice', label: 'Выбор картинки', icon: '🖼' },
  { value: 'ranking', label: 'Ранжирование', icon: '1️⃣' },
  { value: 'yes_no', label: 'Да/Нет', icon: '✓' },
];
