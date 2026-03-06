'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Quiz, Question, QuestionType, FlowNode, Result, QuizDesign, defaultDesign, questionTypes } from '@/types/quiz';

const templates: Record<string, Quiz> = {
  onboarding: {
    id: 'onboarding',
    title: 'Онбординг',
    description: 'Знакомство с пользователем',
    questions: [
      { id: '1', type: 'text', question: 'Как вас зовут?', required: true, points: 0 },
      { id: '2', type: 'email', question: 'Ваш email?', required: true, points: 0 },
      { id: '3', type: 'multiple_choice', question: 'Откуда узнали о нас?', required: false, points: 5, options: [
        { id: 'o1', text: 'Соцсети' }, { id: 'o2', text: 'Друзья' }, { id: 'o3', text: 'Поиск' }, { id: 'o4', text: 'Другое' }
      ]},
      { id: '4', type: 'multiple_choice', question: 'Какая цель?', required: true, points: 10, options: [
        { id: 'o1', text: 'Обучение' }, { id: 'o2', text: 'Работа' }, { id: 'o3', text: 'Хобби' }, { id: 'o4', text: 'Другое' }
      ]},
      { id: '5', type: 'scale', question: 'Насколько серьезно?', required: true, points: 10, min: 1, max: 10 },
    ],
    flow: [],
    results: [],
    design: defaultDesign,
    settings: { shuffleQuestions: false, showResults: true, collectEmail: true }
  },
  knowledge_test: {
    id: 'knowledge_test',
    title: 'Тест знаний',
    description: 'Проверка знаний по теме',
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Вопрос 1', required: true, points: 10, options: [
        { id: 'o1', text: 'Правильный ответ', points: 10 }, { id: 'o2', text: 'Неправильный' }, { id: 'o3', text: 'Неправильный' }
      ]},
      { id: '2', type: 'multiple_choice', question: 'Вопрос 2', required: true, points: 10, options: [
        { id: 'o1', text: 'Вариант А' }, { id: 'o2', text: 'Вариант Б', points: 10 }, { id: 'o3', text: 'Вариант В' }
      ]},
      { id: '3', type: 'yes_no', question: 'Верно ли утверждение?', required: true, points: 10 },
      { id: '4', type: 'rating', question: 'Оцените сложность', required: false, points: 5 },
    ],
    flow: [],
    results: [
      { id: 'r1', title: 'Отлично!', description: 'Вы прошли тест', minScore: 80, maxScore: 100 },
      { id: 'r2', title: 'Хорошо', description: 'Неплохой результат', minScore: 50, maxScore: 79 },
      { id: 'r3', title: 'Попробуйте еще', description: 'Нужно больше практики', minScore: 0, maxScore: 49 },
    ],
    design: defaultDesign,
    settings: { shuffleQuestions: true, showResults: true, collectEmail: false }
  },
  lead_magnet: {
    id: 'lead_magnet',
    title: 'Лид-магнит',
    description: 'Сбор контактов',
    questions: [
      { id: '1', type: 'text', question: 'Ваше имя', required: true, points: 0 },
      { id: '2', type: 'email', question: 'Email для отправки', required: true, points: 0 },
      { id: '3', type: 'multiple_choice', question: 'Интересует?', required: true, points: 5, options: [
        { id: 'o1', text: 'Да, очень' }, { id: 'o2', text: 'Немного' }, { id: 'o3', text: 'Нет' }
      ]},
    ],
    flow: [],
    results: [],
    design: defaultDesign,
    settings: { shuffleQuestions: false, showResults: true, collectEmail: true }
  },
  product_fit: {
    id: 'product_fit',
    title: 'Product-Market Fit',
    description: 'Оценка потребности в продукте',
    questions: [
      { id: '1', type: 'text', question: 'Какую проблему решаете?', required: true, points: 0 },
      { id: '2', type: 'scale', question: 'Насколько это болезненно?', required: true, points: 10, min: 1, max: 10 },
      { id: '3', type: 'multiple_choice', question: 'Сколько платили за подобное?', required: false, points: 10, options: [
        { id: 'o1', text: 'Бесплатно' }, { id: 'o2', text: 'До 1000₽' }, { id: 'o3', text: '1000-5000₽' }, { id: 'o4', text: 'Больше' }
      ]},
      { id: '4', type: 'multiple_choice', question: 'Готовы платить за решение?', required: true, points: 20, options: [
        { id: 'o1', text: 'Да' }, { id: 'o2', text: 'Возможно' }, { id: 'o3', text: 'Нет' }
      ]},
    ],
    flow: [],
    results: [
      { id: 'r1', title: 'Высокий PMF', description: 'Отличный продукт!', minScore: 70, maxScore: 100 },
      { id: 'r2', title: 'Средний PMF', description: 'Есть над чем работать', minScore: 40, maxScore: 69 },
      { id: 'r3', title: 'Низкий PMF', description: 'Нужно пересмотреть продукт', minScore: 0, maxScore: 39 },
    ],
    design: defaultDesign,
    settings: { shuffleQuestions: false, showResults: true, collectEmail: true }
  },
  survey: {
    id: 'survey',
    title: 'Опрос',
    description: 'Сбор обратной связи',
    questions: [
      { id: '1', type: 'rating', question: 'Общая оценка', required: true, points: 0 },
      { id: '2', type: 'multiple_choice', question: 'Что понравилось?', required: false, points: 0, options: [
        { id: 'o1', text: 'Дизайн' }, { id: 'o2', text: 'Функционал' }, { id: 'o3', text: 'Поддержка' }, { id: 'o4', text: 'Другое' }
      ]},
      { id: '3', type: 'text', question: 'Что улучшить?', required: false, points: 0 },
      { id: '4', type: 'yes_no', question: 'Рекомендуете?', required: true, points: 10 },
    ],
    flow: [],
    results: [],
    design: defaultDesign,
    settings: { shuffleQuestions: false, showResults: false, collectEmail: false }
  },
  personality: {
    id: 'personality',
    title: 'Тип личности',
    description: 'Определение типа',
    questions: [
      { id: '1', type: 'multiple_choice', question: 'Как работаете?', required: true, points: 10, options: [
        { id: 'o1', text: 'В команде' }, { id: 'o2', text: 'Самостоятельно' }, { id: 'o3', text: 'В паре' }
      ]},
      { id: '2', type: 'multiple_choice', question: 'Что важнее?', required: true, points: 10, options: [
        { id: 'o1', text: 'Результат' }, { id: 'o2', text: 'Процесс' }, { id: 'o3', text: 'Отношения' }
      ]},
      { id: '3', type: 'multiple_choice', question: 'Как принимаете решения?', required: true, points: 10, options: [
        { id: 'o1', text: 'Быстро' }, { id: 'o2', text: 'Обдумываю' }, { id: 'o3', text: 'Советуюсь' }
      ]},
      { id: '4', type: 'multiple_choice', question: 'Стратегия?', required: true, points: 10, options: [
        { id: 'o1', text: 'Планирование' }, { id: 'o2', text: 'Импровизация' }, { id: 'o3', text: 'Адаптация' }
      ]},
    ],
    flow: [],
    results: [
      { id: 'r1', title: 'Лидер', description: 'Вы — прирожденный лидер', minScore: 30, maxScore: 40 },
      { id: 'r2', title: 'Аналитик', description: 'Вы — думающий стратег', minScore: 20, maxScore: 29 },
      { id: 'r3', title: 'Командный игрок', description: 'Вы — душа команды', minScore: 10, maxScore: 19 },
    ],
    design: defaultDesign,
    settings: { shuffleQuestions: false, showResults: true, collectEmail: false }
  },
};

type Tab = 'questions' | 'flow' | 'design' | 'settings';

export default function QuizBuilder() {
  const [activeTab, setActiveTab] = useState<Tab>('questions');
  const [quiz, setQuiz] = useState<Quiz>({
    id: uuidv4(),
    title: '',
    description: '',
    questions: [],
    flow: [],
    results: [],
    design: defaultDesign,
    settings: { shuffleQuestions: false, showResults: true, collectEmail: false }
  });
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  const selectedQuestion = quiz.questions.find(q => q.id === selectedQuestionId);

  const applyTemplate = useCallback((templateKey: string) => {
    const template = templates[templateKey];
    if (template) {
      const newQuiz: Quiz = {
        ...template,
        id: uuidv4(),
        questions: template.questions.map(q => ({ ...q, id: uuidv4() })),
        flow: template.flow.map(f => ({ ...f, id: uuidv4() })),
        results: template.results.map(r => ({ ...r, id: uuidv4() })),
        design: { ...template.design },
      };
      setQuiz(newQuiz);
      setSelectedQuestionId(newQuiz.questions[0]?.id || null);
    }
  }, []);

  const addQuestion = useCallback((type: QuestionType = 'multiple_choice') => {
    const newQuestion: Question = {
      id: uuidv4(),
      type,
      question: 'Новый вопрос',
      required: false,
      points: 10,
      options: type === 'multiple_choice' || type === 'multi_select' ? [
        { id: uuidv4(), text: 'Вариант 1' },
        { id: uuidv4(), text: 'Вариант 2' },
      ] : undefined,
      min: type === 'scale' || type === 'slider' ? 1 : undefined,
      max: type === 'scale' || type === 'slider' ? 10 : undefined,
    };
    setQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setSelectedQuestionId(newQuestion.id);
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => q.id === id ? { ...q, ...updates } : q),
    }));
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id),
    }));
    if (selectedQuestionId === id) {
      setSelectedQuestionId(null);
    }
  }, [selectedQuestionId]);

  const addOption = useCallback((questionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: [...(q.options || []), { id: uuidv4(), text: `Вариант ${(q.options?.length || 0) + 1}` }] };
      }),
    }));
  }, []);

  const updateOption = useCallback((questionId: string, optionId: string, text: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: q.options?.map(o => o.id === optionId ? { ...o, text } : o) };
      }),
    }));
  }, []);

  const removeOption = useCallback((questionId: string, optionId: string) => {
    setQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        return { ...q, options: q.options?.filter(o => o.id !== optionId) };
      }),
    }));
  }, []);

  const handleDragStart = (questionId: string) => {
    setDraggedQuestion(questionId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedQuestion || draggedQuestion === targetId) return;
    
    setQuiz(prev => {
      const questions = [...prev.questions];
      const draggedIndex = questions.findIndex(q => q.id === draggedQuestion);
      const targetIndex = questions.findIndex(q => q.id === targetId);
      
      const [dragged] = questions.splice(draggedIndex, 1);
      questions.splice(targetIndex, 0, dragged);
      
      return { ...prev, questions };
    });
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
  };

  const updateDesign = useCallback((updates: Partial<QuizDesign>) => {
    setQuiz(prev => ({
      ...prev,
      design: { ...prev.design, ...updates },
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<Quiz['settings']>) => {
    setQuiz(prev => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const addResult = useCallback(() => {
    const newResult: Result = {
      id: uuidv4(),
      title: 'Новый результат',
      description: 'Описание',
      minScore: 0,
      maxScore: 100,
    };
    setQuiz(prev => ({
      ...prev,
      results: [...prev.results, newResult],
    }));
  }, []);

  const updateResult = useCallback((id: string, updates: Partial<Result>) => {
    setQuiz(prev => ({
      ...prev,
      results: prev.results.map(r => r.id === id ? { ...r, ...updates } : r),
    }));
  }, []);

  const removeResult = useCallback((id: string) => {
    setQuiz(prev => ({
      ...prev,
      results: prev.results.filter(r => r.id !== id),
    }));
  }, []);

  const exportQuiz = (format: 'json' | 'html') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(quiz, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quiz.title || 'quiz'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const html = generateHTMLQuiz(quiz);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quiz.title || 'quiz'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const generateHTMLQuiz = (q: Quiz): string => {
    const { design } = q;
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${q.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: '${design.fontFamily}', sans-serif; 
      background: ${design.backgroundImage ? `url(${design.backgroundImage})` : design.backgroundColor};
      color: ${design.textColor};
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .quiz-container {
      background: rgba(22, 22, 31, 0.95);
      border-radius: 20px;
      padding: 40px;
      max-width: 600px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 { text-align: center; margin-bottom: 10px; color: ${design.primaryColor}; }
    .description { text-align: center; color: #94a3b8; margin-bottom: 30px; }
    .question { margin-bottom: 30px; }
    .question-text { font-size: 1.2em; margin-bottom: 15px; font-weight: 500; }
    .question-desc { color: #94a3b8; font-size: 0.9em; margin-bottom: 15px; }
    .options { display: flex; flex-direction: column; gap: 10px; }
    .option {
      padding: 15px 20px;
      background: #1e1e2a;
      border: 2px solid #2e2e3a;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .option:hover { border-color: ${design.primaryColor}; }
    .option.selected { background: ${design.primaryColor}; border-color: ${design.primaryColor}; }
    input, textarea { 
      width: 100%; 
      padding: 15px; 
      background: #1e1e2a; 
      border: 2px solid #2e2e3a; 
      border-radius: 12px;
      color: white;
      font-size: 1em;
    }
    input:focus, textarea:focus { outline: none; border-color: ${design.primaryColor}; }
    .btn {
      background: ${design.buttonColor};
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: ${design.buttonStyle === 'rounded' ? '12px' : design.buttonStyle === 'pill' ? '30px' : '8px'};
      font-size: 1em;
      cursor: pointer;
      width: 100%;
      margin-top: 20px;
    }
    .btn:hover { filter: brightness(1.1); }
    .progress { height: 4px; background: #2e2e3a; border-radius: 2px; margin-bottom: 30px; }
    .progress-bar { height: 100%; background: ${design.primaryColor}; border-radius: 2px; transition: width 0.3s; }
    .result { text-align: center; padding: 40px; }
    .result-title { font-size: 2em; color: ${design.accentColor}; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="quiz-container">
    <h1>${q.title}</h1>
    <p class="description">${q.description}</p>
    <div class="progress"><div class="progress-bar" style="width: 0%"></div></div>
    <div id="quiz-content">
      ${q.questions.map((question, i) => `
        <div class="question" data-index="${i}" style="display: ${i === 0 ? 'block' : 'none'}">
          <div class="question-text">${i + 1}. ${question.question}</div>
          ${question.description ? `<div class="question-desc">${question.description}</div>` : ''}
          ${renderQuestionHTML(question, design)}
          <button class="btn" onclick="nextQuestion(${i})">Далее</button>
        </div>
      `).join('')}
    </div>
  </div>
  <script>
    let currentIndex = 0;
    const total = ${q.questions.length};
    function nextQuestion(i) {
      document.querySelectorAll('.question')[i].style.display = 'none';
      if (i + 1 < total) {
        document.querySelectorAll('.question')[i + 1].style.display = 'block';
        document.querySelector('.progress-bar').style.width = ((i + 1) / total * 100) + '%';
      } else {
        document.getElementById('quiz-content').innerHTML = '<div class="result"><div class="result-title">Спасибо!</div><p>Ваши ответы сохранены</p></div>';
      }
    }
  </script>
</body>
</html>`;
  };

  const renderQuestionHTML = (question: Question, design: QuizDesign): string => {
    switch (question.type) {
      case 'multiple_choice':
      case 'yes_no':
        return `<div class="options">
          ${question.options?.map((opt, i) => `
            <div class="option" onclick="this.classList.toggle('selected')">${opt.text}</div>
          `).join('') || ''}
        </div>`;
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return `<input type="${question.type === 'number' ? 'number' : question.type}" placeholder="${question.placeholder || ''}">`;
      case 'rating':
        return `<div class="options">${[1,2,3,4,5].map(i => `<div class="option" onclick="this.classList.toggle('selected')">⭐</div>`).join('')}</div>`;
      case 'scale':
        return `<input type="range" min="${question.min || 1}" max="${question.max || 10}" style="width:100%">`;
      default:
        return `<input type="text" placeholder="Ваш ответ">`;
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'questions', label: 'Вопросы', icon: '?' },
    { id: 'flow', label: 'Сценарий', icon: '↳' },
    { id: 'design', label: 'Дизайн', icon: '🎨' },
    { id: 'settings', label: 'Настройки', icon: '⚙' },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent">
          Quiz Forge Pro
        </h1>
        <div className="flex gap-2">
          <button onClick={() => exportQuiz('json')} className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--surface)] transition-colors">
            JSON
          </button>
          <button onClick={() => exportQuiz('html')} className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg font-medium transition-colors">
            Экспорт HTML
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-[var(--border)] p-4 flex flex-col gap-2">
          <div className="mb-4">
            <label className="text-xs text-[var(--muted)] uppercase tracking-wider">Шаблоны</label>
            <select 
              onChange={(e) => e.target.value && applyTemplate(e.target.value)}
              className="w-full mt-2 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="">Выбрать шаблон...</option>
              {Object.entries(templates).map(([key, tpl]) => (
                <option key={key} value={key}>{tpl.title}</option>
              ))}
            </select>
          </div>

          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-[var(--primary)]/20 text-[var(--primary)]' 
                    : 'hover:bg-[var(--surface)] text-[var(--muted)]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={quiz.title}
                  onChange={e => setQuiz(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Название квиза"
                  className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-lg font-semibold"
                />
                <input
                  type="text"
                  value={quiz.description}
                  onChange={e => setQuiz(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание"
                  className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div className="space-y-2">
                {quiz.questions.map((q, index) => (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={() => handleDragStart(q.id)}
                    onDragOver={(e) => handleDragOver(e, q.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedQuestionId(q.id)}
                    className={`p-4 bg-[var(--surface)] border rounded-lg cursor-pointer transition-all ${
                      selectedQuestionId === q.id 
                        ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20' 
                        : 'border-[var(--border)] hover:border-[var(--primary)]/50'
                    } ${draggedQuestion === q.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-[var(--primary)]/20 rounded-lg text-[var(--primary)] font-medium">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium">{q.question}</div>
                          <div className="text-xs text-[var(--muted)]">{questionTypes.find(t => t.value === q.type)?.label} • {q.points} баллов</div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}
                        className="p-2 text-[var(--muted)] hover:text-[var(--error)] transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-[var(--muted)] self-center">Добавить:</span>
                {questionTypes.slice(0, 6).map(type => (
                  <button
                    key={type.value}
                    onClick={() => addQuestion(type.value)}
                    className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm hover:border-[var(--primary)] transition-colors"
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <h3 className="font-semibold mb-4">Результаты квиза</h3>
                {quiz.results.length === 0 ? (
                  <p className="text-[var(--muted)] mb-4">Нет результатов. Добавьте для отображения итогов.</p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {quiz.results.map(result => (
                      <div key={result.id} className="p-3 bg-[var(--background)] rounded-lg">
                        <input
                          type="text"
                          value={result.title}
                          onChange={e => updateResult(result.id, { title: e.target.value })}
                          className="w-full bg-transparent font-medium mb-1"
                        />
                        <input
                          type="text"
                          value={result.description}
                          onChange={e => updateResult(result.id, { description: e.target.value })}
                          className="w-full bg-transparent text-sm text-[var(--muted)]"
                        />
                        <div className="flex gap-2 mt-2">
                          <input
                            type="number"
                            value={result.minScore}
                            onChange={e => updateResult(result.id, { minScore: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-sm"
                            placeholder="Мин"
                          />
                          <input
                            type="number"
                            value={result.maxScore}
                            onChange={e => updateResult(result.id, { maxScore: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-sm"
                            placeholder="Макс"
                          />
                          <button onClick={() => removeResult(result.id)} className="text-[var(--error)] text-sm">Удалить</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button onClick={addResult} className="px-4 py-2 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/30 transition-colors">
                  + Добавить результат
                </button>
              </div>

              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <h3 className="font-semibold mb-4">Визуальный поток</h3>
                <div className="flex flex-wrap gap-4">
                  {quiz.questions.map((q, i) => (
                    <div key={q.id} className="flex items-center gap-2">
                      <div className={`px-4 py-3 bg-[var(--background)] border rounded-lg ${selectedQuestionId === q.id ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
                        <div className="text-sm font-medium">{q.question.slice(0, 20)}...</div>
                        <div className="text-xs text-[var(--muted)]">Вопрос {i + 1}</div>
                      </div>
                      {i < quiz.questions.length - 1 && <span className="text-[var(--muted)]">→</span>}
                    </div>
                  ))}
                  {quiz.questions.length > 0 && <span className="text-[var(--muted)]">→ 📊 Результат</span>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Цвета</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[var(--muted)]">Основной цвет</label>
                    <input
                      type="color"
                      value={quiz.design.primaryColor}
                      onChange={e => updateDesign({ primaryColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)]">Акцентный цвет</label>
                    <input
                      type="color"
                      value={quiz.design.accentColor}
                      onChange={e => updateDesign({ accentColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)]">Цвет фона</label>
                    <input
                      type="color"
                      value={quiz.design.backgroundColor}
                      onChange={e => updateDesign({ backgroundColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)]">Цвет кнопок</label>
                    <input
                      type="color"
                      value={quiz.design.buttonColor}
                      onChange={e => updateDesign({ buttonColor: e.target.value })}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                <h3 className="font-semibold mt-6">Стиль</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[var(--muted)]">Шрифт</label>
                    <select
                      value={quiz.design.fontFamily}
                      onChange={e => updateDesign({ fontFamily: e.target.value })}
                      className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                    >
                      <option value="DM Sans">DM Sans</option>
                      <option value="Outfit">Outfit</option>
                      <option value="Inter">Inter</option>
                      <option value="Roboto">Roboto</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-[var(--muted)]">Стиль кнопок</label>
                    <div className="flex gap-2 mt-2">
                      {(['rounded', 'square', 'pill'] as const).map(style => (
                        <button
                          key={style}
                          onClick={() => updateDesign({ buttonStyle: style })}
                          className={`flex-1 py-2 border rounded-lg capitalize ${
                            quiz.design.buttonStyle === style 
                              ? 'border-[var(--primary)] bg-[var(--primary)]/20' 
                              : 'border-[var(--border)]'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Элементы</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quiz.design.showProgress}
                      onChange={e => updateDesign({ showProgress: e.target.checked })}
                      className="w-5 h-5 accent-[var(--primary)]"
                    />
                    Показывать прогресс
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={quiz.design.showTimer}
                      onChange={e => updateDesign({ showTimer: e.target.checked })}
                      className="w-5 h-5 accent-[var(--primary)]"
                    />
                    Показывать таймер
                  </label>
                </div>

                <h3 className="font-semibold mt-6">Превью дизайна</h3>
                <div 
                  className="p-6 rounded-xl"
                  style={{ background: quiz.design.backgroundColor, color: quiz.design.textColor }}
                >
                  <h4 style={{ color: quiz.design.primaryColor }} className="font-bold mb-2">{quiz.title || 'Название'}</h4>
                  <p className="text-sm opacity-70 mb-4">{quiz.description || 'Описание'}</p>
                  <div className="space-y-2 mb-4">
                    <div className="p-3 rounded-lg bg-white/10 text-sm">Вариант 1</div>
                    <div className="p-3 rounded-lg bg-white/10 text-sm">Вариант 2</div>
                  </div>
                  <button
                    style={{ 
                      background: quiz.design.buttonColor, 
                      borderRadius: quiz.design.buttonStyle === 'rounded' ? '12px' : quiz.design.buttonStyle === 'pill' ? '30px' : '4px' 
                    }}
                    className="w-full py-3 font-medium"
                  >
                    Далее
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-4">
                <h3 className="font-semibold">Настройки квиза</h3>
                
                <label className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quiz.settings.shuffleQuestions}
                    onChange={e => updateSettings({ shuffleQuestions: e.target.checked })}
                    className="w-5 h-5 accent-[var(--primary)]"
                  />
                  Перемешать вопросы
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quiz.settings.showResults}
                    onChange={e => updateSettings({ showResults: e.target.checked })}
                    className="w-5 h-5 accent-[var(--primary)]"
                  />
                  Показать результаты
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quiz.settings.collectEmail}
                    onChange={e => updateSettings({ collectEmail: e.target.checked })}
                    className="w-5 h-5 accent-[var(--primary)]"
                  />
                  Сбор email
                </label>

                <div>
                  <label className="text-sm text-[var(--muted)]">URL редирект после завершения</label>
                  <input
                    type="text"
                    value={quiz.settings.redirectUrl || ''}
                    onChange={e => updateSettings({ redirectUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full mt-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                  />
                </div>
              </div>

              <div className="p-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
                <h3 className="font-semibold mb-4">Статистика</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[var(--background)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--primary)]">{quiz.questions.length}</div>
                    <div className="text-xs text-[var(--muted)]">Вопросов</div>
                  </div>
                  <div className="text-center p-4 bg-[var(--background)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--accent)]">{quiz.questions.reduce((sum, q) => sum + q.points, 0)}</div>
                    <div className="text-xs text-[var(--muted)]">Макс. баллов</div>
                  </div>
                  <div className="text-center p-4 bg-[var(--background)] rounded-lg">
                    <div className="text-2xl font-bold text-[var(--success)]">{quiz.results.length}</div>
                    <div className="text-xs text-[var(--muted)]">Результатов</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {selectedQuestion && (
          <aside className="w-80 border-l border-[var(--border)] p-4 overflow-auto">
            <h3 className="font-semibold mb-4">Редактор вопроса</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--muted)]">Тип вопроса</label>
                <select
                  value={selectedQuestion.type}
                  onChange={e => updateQuestion(selectedQuestion.id, { type: e.target.value as QuestionType })}
                  className="w-full mt-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                >
                  {questionTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--muted)]">Вопрос</label>
                <textarea
                  value={selectedQuestion.question}
                  onChange={e => updateQuestion(selectedQuestion.id, { question: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-xs text-[var(--muted)]">Описание</label>
                <input
                  type="text"
                  value={selectedQuestion.description || ''}
                  onChange={e => updateQuestion(selectedQuestion.id, { description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-[var(--muted)]">Баллы</label>
                  <input
                    type="number"
                    value={selectedQuestion.points}
                    onChange={e => updateQuestion(selectedQuestion.id, { points: parseInt(e.target.value) || 0 })}
                    className="w-full mt-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-[var(--muted)]">Таймер (сек)</label>
                  <input
                    type="number"
                    value={selectedQuestion.timer || ''}
                    onChange={e => updateQuestion(selectedQuestion.id, { timer: parseInt(e.target.value) || undefined })}
                    className="w-full mt-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedQuestion.required}
                  onChange={e => updateQuestion(selectedQuestion.id, { required: e.target.checked })}
                  className="accent-[var(--primary)]"
                />
                <span className="text-sm">Обязательный</span>
              </label>

              {(selectedQuestion.type === 'multiple_choice' || selectedQuestion.type === 'multi_select') && (
                <div>
                  <label className="text-xs text-[var(--muted)]">Варианты ответов</label>
                  <div className="space-y-2 mt-2">
                    {selectedQuestion.options?.map((opt, i) => (
                      <div key={opt.id} className="flex gap-2">
                        <input
                          type="text"
                          value={opt.text}
                          onChange={e => updateOption(selectedQuestion.id, opt.id, e.target.value)}
                          placeholder={`Вариант ${i + 1}`}
                          className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
                        />
                        <button
                          onClick={() => removeOption(selectedQuestion.id, opt.id)}
                          className="text-[var(--muted)] hover:text-[var(--error)]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(selectedQuestion.id)}
                      className="text-sm text-[var(--primary)] hover:text-[var(--primary-hover)]"
                    >
                      + Добавить вариант
                    </button>
                  </div>
                </div>
              )}

              {(selectedQuestion.type === 'scale' || selectedQuestion.type === 'slider') && (
                <div className="flex gap-2">
                  <div>
                    <label className="text-xs text-[var(--muted)]">Мин</label>
                    <input
                      type="number"
                      value={selectedQuestion.min || 1}
                      onChange={e => updateQuestion(selectedQuestion.id, { min: parseInt(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted)]">Макс</label>
                    <input
                      type="number"
                      value={selectedQuestion.max || 10}
                      onChange={e => updateQuestion(selectedQuestion.id, { max: parseInt(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
